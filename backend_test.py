"""
Phase 4 Backend Testing: Brochure Personalisation & Package Recommender
Tests all backend endpoints for brochure download and package recommendation.
"""
import requests
import sys
from datetime import datetime

BASE_URL = "https://ai-homes-3.preview.emergentagent.com/api"
ADMIN_EMAIL = "admin@constructons.in"
ADMIN_PASSWORD = "admin123"

class Phase4BackendTester:
    def __init__(self):
        self.tests_run = 0
        self.tests_passed = 0
        self.admin_token = None
        self.test_results = []

    def log_test(self, name, passed, details=""):
        """Log test result"""
        self.tests_run += 1
        if passed:
            self.tests_passed += 1
            print(f"✅ PASS: {name}")
        else:
            print(f"❌ FAIL: {name}")
        if details:
            print(f"   {details}")
        self.test_results.append({"name": name, "passed": passed, "details": details})

    def admin_login(self):
        """Login as admin to access leads endpoint"""
        print("\n🔐 Logging in as admin...")
        try:
            response = requests.post(f"{BASE_URL}/admin/login", json={
                "email": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD
            }, timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.admin_token = data.get("token")
                print(f"✅ Admin login successful, token: {self.admin_token[:20]}...")
                return True
            else:
                print(f"❌ Admin login failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Admin login error: {str(e)}")
            return False

    def test_brochure_basic_package(self):
        """Test POST /api/packages/basic/brochure with name+phone+city"""
        print("\n📋 Test 1: POST /api/packages/basic/brochure with full payload")
        try:
            response = requests.post(
                f"{BASE_URL}/packages/basic/brochure",
                json={
                    "name": "Ramesh",
                    "phone": "9999912345",
                    "city": "Bangalore"
                },
                timeout=15
            )
            
            # Check status code
            status_ok = response.status_code == 200
            
            # Check content-type
            content_type = response.headers.get("content-type", "")
            content_type_ok = "application/pdf" in content_type
            
            # Check size >= 15KB
            size = len(response.content)
            size_ok = size >= 15000
            
            # Check X-Quote-Ref header
            quote_ref = response.headers.get("X-Quote-Ref") or response.headers.get("x-quote-ref")
            quote_ref_ok = quote_ref and quote_ref.startswith("CONS-")
            
            # Check content-disposition
            content_disp = response.headers.get("content-disposition", "")
            filename_ok = "filename" in content_disp
            
            all_ok = status_ok and content_type_ok and size_ok and quote_ref_ok and filename_ok
            
            details = f"Status: {response.status_code}, Content-Type: {content_type}, Size: {size} bytes, Quote-Ref: {quote_ref}, Content-Disposition: {content_disp[:50]}"
            self.log_test("Brochure basic package with full payload", all_ok, details)
            
            if not status_ok:
                print(f"   Response body: {response.text[:200]}")
            
            return quote_ref if all_ok else None
            
        except Exception as e:
            self.log_test("Brochure basic package with full payload", False, f"Error: {str(e)}")
            return None

    def test_brochure_premium_required_only(self):
        """Test POST /api/packages/premium/brochure with only required fields"""
        print("\n📋 Test 2: POST /api/packages/premium/brochure with only name+phone")
        try:
            response = requests.post(
                f"{BASE_URL}/packages/premium/brochure",
                json={
                    "name": "Priya Kumar",
                    "phone": "9876543210"
                },
                timeout=15
            )
            
            status_ok = response.status_code == 200
            content_type_ok = "application/pdf" in response.headers.get("content-type", "")
            size_ok = len(response.content) >= 15000
            
            all_ok = status_ok and content_type_ok and size_ok
            details = f"Status: {response.status_code}, Size: {len(response.content)} bytes"
            self.log_test("Brochure premium package with required fields only", all_ok, details)
            
            if not status_ok:
                print(f"   Response body: {response.text[:200]}")
            
        except Exception as e:
            self.log_test("Brochure premium package with required fields only", False, f"Error: {str(e)}")

    def test_brochure_invalid_package(self):
        """Test POST /api/packages/invalid/brochure returns 404"""
        print("\n📋 Test 3: POST /api/packages/invalid/brochure should return 404")
        try:
            response = requests.post(
                f"{BASE_URL}/packages/invalid/brochure",
                json={
                    "name": "Test User",
                    "phone": "1234567890"
                },
                timeout=10
            )
            
            status_ok = response.status_code == 404
            details = f"Status: {response.status_code}"
            self.log_test("Brochure invalid package returns 404", status_ok, details)
            
        except Exception as e:
            self.log_test("Brochure invalid package returns 404", False, f"Error: {str(e)}")

    def test_lead_creation_after_brochure(self, quote_ref):
        """Test that lead is created after brochure download"""
        print("\n📋 Test 4: Verify lead creation after brochure download")
        
        if not self.admin_token:
            self.log_test("Lead creation verification", False, "Admin token not available")
            return
        
        # First, download a brochure to create a lead
        print("   Creating a new brochure download to generate lead...")
        try:
            timestamp = datetime.now().strftime("%H%M%S")
            response = requests.post(
                f"{BASE_URL}/packages/standard/brochure",
                json={
                    "name": f"Test Lead {timestamp}",
                    "phone": f"99999{timestamp[-5:]}"
                },
                timeout=15
            )
            
            if response.status_code != 200:
                self.log_test("Lead creation verification", False, f"Brochure download failed: {response.status_code}")
                return
            
            new_quote_ref = response.headers.get("X-Quote-Ref") or response.headers.get("x-quote-ref")
            print(f"   New quote ref: {new_quote_ref}")
            
            # Now check leads
            leads_response = requests.get(
                f"{BASE_URL}/leads",
                headers={"Authorization": f"Bearer {self.admin_token}"},
                timeout=10
            )
            
            if leads_response.status_code != 200:
                self.log_test("Lead creation verification", False, f"Failed to fetch leads: {leads_response.status_code}")
                return
            
            leads = leads_response.json()
            
            # Find lead with source='brochure_download' and matching quote_ref
            matching_lead = None
            for lead in leads:
                if lead.get("source") == "brochure_download" and lead.get("quote_ref") == new_quote_ref:
                    matching_lead = lead
                    break
            
            if matching_lead:
                details = f"Found lead: source={matching_lead.get('source')}, quote_ref={matching_lead.get('quote_ref')}, package={matching_lead.get('interested_package')}"
                self.log_test("Lead creation verification", True, details)
            else:
                # Check if any brochure_download leads exist
                brochure_leads = [l for l in leads if l.get("source") == "brochure_download"]
                details = f"No matching lead found. Total leads: {len(leads)}, Brochure leads: {len(brochure_leads)}"
                self.log_test("Lead creation verification", False, details)
            
        except Exception as e:
            self.log_test("Lead creation verification", False, f"Error: {str(e)}")

    def test_recommend_premium_budget(self):
        """Test POST /api/recommend with premium budget → standard tier"""
        print("\n📋 Test 5: POST /api/recommend with premium budget should recommend standard tier")
        try:
            response = requests.post(
                f"{BASE_URL}/recommend",
                json={
                    "budget": "premium",
                    "family_size": "3-4",
                    "style": "modern",
                    "smart_home": "basic"
                },
                timeout=10
            )
            
            if response.status_code != 200:
                self.log_test("Recommend premium budget", False, f"Status: {response.status_code}, Body: {response.text[:200]}")
                return
            
            data = response.json()
            recommended = data.get("recommended_package", {})
            tier = recommended.get("tier", "").lower()
            
            # Check structure
            has_structure = all(k in data for k in ["recommended_package", "shortlisted_homes", "score", "alternatives"])
            tier_ok = tier == "standard"
            
            all_ok = has_structure and tier_ok
            details = f"Recommended tier: {tier}, Score: {data.get('score')}, Homes: {len(data.get('shortlisted_homes', []))}"
            self.log_test("Recommend premium budget → standard tier", all_ok, details)
            
        except Exception as e:
            self.log_test("Recommend premium budget → standard tier", False, f"Error: {str(e)}")

    def test_recommend_value_budget(self):
        """Test POST /api/recommend with value budget → basic tier"""
        print("\n📋 Test 6: POST /api/recommend with value budget should recommend basic tier")
        try:
            response = requests.post(
                f"{BASE_URL}/recommend",
                json={
                    "budget": "value",
                    "family_size": "1-2",
                    "style": "any",
                    "smart_home": "no"
                },
                timeout=10
            )
            
            if response.status_code != 200:
                self.log_test("Recommend value budget", False, f"Status: {response.status_code}")
                return
            
            data = response.json()
            recommended = data.get("recommended_package", {})
            tier = recommended.get("tier", "").lower()
            
            tier_ok = tier == "basic"
            details = f"Recommended tier: {tier}, Package: {recommended.get('name')}"
            self.log_test("Recommend value budget → basic tier", tier_ok, details)
            
        except Exception as e:
            self.log_test("Recommend value budget → basic tier", False, f"Error: {str(e)}")

    def test_recommend_luxury_budget(self):
        """Test POST /api/recommend with luxury budget → premium tier"""
        print("\n📋 Test 7: POST /api/recommend with luxury budget should recommend premium tier")
        try:
            response = requests.post(
                f"{BASE_URL}/recommend",
                json={
                    "budget": "luxury",
                    "family_size": "5+",
                    "style": "villa",
                    "smart_home": "full"
                },
                timeout=10
            )
            
            if response.status_code != 200:
                self.log_test("Recommend luxury budget", False, f"Status: {response.status_code}")
                return
            
            data = response.json()
            recommended = data.get("recommended_package", {})
            tier = recommended.get("tier", "").lower()
            
            tier_ok = tier == "premium"
            details = f"Recommended tier: {tier}, Package: {recommended.get('name')}"
            self.log_test("Recommend luxury budget → premium tier", tier_ok, details)
            
        except Exception as e:
            self.log_test("Recommend luxury budget → premium tier", False, f"Error: {str(e)}")

    def run_all_tests(self):
        """Run all backend tests"""
        print("=" * 70)
        print("🚀 PHASE 4 BACKEND TESTING - Brochure & Recommender")
        print("=" * 70)
        
        # Test brochure endpoints
        quote_ref = self.test_brochure_basic_package()
        self.test_brochure_premium_required_only()
        self.test_brochure_invalid_package()
        
        # Login as admin and test lead creation
        if self.admin_login():
            self.test_lead_creation_after_brochure(quote_ref)
        
        # Test recommender endpoints
        self.test_recommend_premium_budget()
        self.test_recommend_value_budget()
        self.test_recommend_luxury_budget()
        
        # Print summary
        print("\n" + "=" * 70)
        print(f"📊 BACKEND TEST SUMMARY")
        print("=" * 70)
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed / self.tests_run * 100):.1f}%")
        print("=" * 70)
        
        return 0 if self.tests_passed == self.tests_run else 1

def main():
    tester = Phase4BackendTester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())
