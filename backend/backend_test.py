#!/usr/bin/env python3
"""
ConstructONS Backend API Test Suite
Tests all backend endpoints for the ConstructONS CMS
"""
import requests
import sys
from datetime import datetime

BASE_URL = "https://ai-homes-3.preview.emergentagent.com/api"
ADMIN_EMAIL = "admin@constructons.in"
ADMIN_PASSWORD = "admin123"
DEV_BYPASS_TOKEN = "dev-bypass-constructons-2025"


class ConstructONSAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log(self, message, level="INFO"):
        """Log test messages"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        self.log(f"Testing {name}...")

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ PASSED - {name} - Status: {response.status_code}", "PASS")
            else:
                self.log(f"❌ FAILED - {name} - Expected {expected_status}, got {response.status_code}", "FAIL")
                self.log(f"   Response: {response.text[:200]}", "FAIL")
                self.failed_tests.append({
                    "name": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "endpoint": endpoint
                })

            try:
                return success, response.json() if response.text else {}
            except Exception:
                return success, {}

        except Exception as e:
            self.log(f"❌ FAILED - {name} - Error: {str(e)}", "ERROR")
            self.failed_tests.append({
                "name": name,
                "error": str(e),
                "endpoint": endpoint
            })
            return False, {}

    def test_bootstrap(self):
        """Test GET /api/bootstrap"""
        success, response = self.run_test(
            "Bootstrap endpoint",
            "GET",
            "bootstrap",
            200
        )
        if success:
            # Verify all required keys are present
            required_keys = ['homes', 'packages', 'ai_modules', 'marketplace', 
                           'financial_services', 'comparison', 'journey', 
                           'testimonials', 'stats', 'hero', 'site_settings']
            missing = [k for k in required_keys if k not in response]
            if missing:
                self.log(f"⚠️  Bootstrap missing keys: {missing}", "WARN")
            else:
                self.log(f"✓ Bootstrap contains all required keys", "INFO")
                self.log(f"  - Homes: {len(response.get('homes', []))}", "INFO")
                self.log(f"  - Packages: {len(response.get('packages', []))}", "INFO")
                self.log(f"  - AI Modules: {len(response.get('ai_modules', []))}", "INFO")
                self.log(f"  - Marketplace: {len(response.get('marketplace', []))}", "INFO")
                self.log(f"  - Financial Services: {len(response.get('financial_services', []))}", "INFO")
                self.log(f"  - Comparison: {len(response.get('comparison', []))}", "INFO")
                self.log(f"  - Journey: {len(response.get('journey', []))}", "INFO")
                self.log(f"  - Testimonials: {len(response.get('testimonials', []))}", "INFO")
                self.log(f"  - Stats: {len(response.get('stats', []))}", "INFO")
        return success, response

    def test_homes_list(self):
        """Test GET /api/homes"""
        success, response = self.run_test(
            "List homes",
            "GET",
            "homes",
            200
        )
        if success and isinstance(response, list):
            self.log(f"✓ Found {len(response)} homes", "INFO")
        return success, response

    def test_home_detail(self, slug="modern-aura"):
        """Test GET /api/homes/{slug}"""
        success, response = self.run_test(
            f"Get home detail: {slug}",
            "GET",
            f"homes/{slug}",
            200
        )
        if success:
            # Verify required fields
            required = ['name', 'slug', 'gallery', 'floor_areas']
            missing = [f for f in required if f not in response]
            if missing:
                self.log(f"⚠️  Home detail missing fields: {missing}", "WARN")
            else:
                self.log(f"✓ Home detail has all required fields", "INFO")
        return success, response

    def test_packages_list(self):
        """Test GET /api/packages"""
        success, response = self.run_test(
            "List packages",
            "GET",
            "packages",
            200
        )
        if success and isinstance(response, list):
            self.log(f"✓ Found {len(response)} packages", "INFO")
            # Check for expected packages
            tiers = [p.get('tier') for p in response]
            self.log(f"  Package tiers: {tiers}", "INFO")
        return success, response

    def test_admin_login(self):
        """Test POST /api/admin/login"""
        success, response = self.run_test(
            "Admin login",
            "POST",
            "admin/login",
            200,
            data={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if success and 'token' in response:
            self.token = response['token']
            self.log(f"✓ Admin login successful, token obtained", "INFO")
        return success, response

    def test_create_lead(self):
        """Test POST /api/leads"""
        timestamp = datetime.now().strftime("%H%M%S")
        lead_data = {
            "name": f"Test User {timestamp}",
            "phone": "+91 9876543210",
            "email": f"test{timestamp}@example.com",
            "city": "Bangalore",
            "message": "Test lead from automated testing",
            "source": "website"
        }
        success, response = self.run_test(
            "Create lead",
            "POST",
            "leads",
            200,
            data=lead_data
        )
        if success and response.get('id'):
            self.log(f"✓ Lead created with ID: {response['id']}", "INFO")
            return success, response['id']
        return success, None

    def test_list_leads(self):
        """Test GET /api/leads (requires auth)"""
        success, response = self.run_test(
            "List leads (admin)",
            "GET",
            "leads",
            200
        )
        if success and isinstance(response, list):
            self.log(f"✓ Found {len(response)} leads", "INFO")
        return success, response

    def test_update_lead(self, lead_id):
        """Test PUT /api/leads/{id}"""
        success, response = self.run_test(
            f"Update lead status: {lead_id}",
            "PUT",
            f"leads/{lead_id}",
            200,
            data={"status": "contacted"}
        )
        return success, response

    def test_update_home(self, home_id):
        """Test PUT /api/homes/{id} (requires auth)"""
        # First get the home
        get_success, home = self.run_test(
            f"Get home for update: {home_id}",
            "GET",
            f"homes/{home_id}",
            200
        )
        if not get_success:
            return False, {}
        
        # Update estimated_cost
        home['estimated_cost'] = "From ₹99.99 Lakhs (TEST)"
        success, response = self.run_test(
            f"Update home: {home_id}",
            "PUT",
            f"homes/{home_id}",
            200,
            data=home
        )
        return success, response

    def test_update_site_settings(self):
        """Test PUT /api/site-settings (requires auth)"""
        # First get current settings
        get_success, settings = self.run_test(
            "Get site settings",
            "GET",
            "site-settings",
            200
        )
        if not get_success:
            return False, {}
        
        # Update phone
        settings['phone'] = "+91 99999 99999 (TEST)"
        success, response = self.run_test(
            "Update site settings",
            "PUT",
            "site-settings",
            200,
            data=settings
        )
        return success, response

    def test_create_and_delete_faq(self):
        """Test POST /api/faqs and DELETE /api/faqs/{id}"""
        # Create FAQ
        faq_data = {
            "question": "Test FAQ Question?",
            "answer": "Test FAQ Answer",
            "category": "test",
            "is_published": True,
            "sort_order": 999
        }
        create_success, response = self.run_test(
            "Create FAQ",
            "POST",
            "faqs",
            200,
            data=faq_data
        )
        if not create_success or not response.get('id'):
            return False, {}
        
        faq_id = response['id']
        self.log(f"✓ FAQ created with ID: {faq_id}", "INFO")
        
        # Delete FAQ
        delete_success, _ = self.run_test(
            f"Delete FAQ: {faq_id}",
            "DELETE",
            f"faqs/{faq_id}",
            200
        )
        return delete_success, {}

    def run_all_tests(self):
        """Run all backend tests"""
        self.log("=" * 60, "INFO")
        self.log("ConstructONS Backend API Test Suite", "INFO")
        self.log("=" * 60, "INFO")
        
        # Public endpoints
        self.log("\n--- Testing Public Endpoints ---", "INFO")
        self.test_bootstrap()
        self.test_homes_list()
        self.test_home_detail("modern-aura")
        self.test_packages_list()
        
        # Create lead (public)
        self.log("\n--- Testing Lead Creation (Public) ---", "INFO")
        _, lead_id = self.test_create_lead()
        
        # Admin login
        self.log("\n--- Testing Admin Authentication ---", "INFO")
        login_success, _ = self.test_admin_login()
        
        if not login_success:
            self.log("⚠️  Admin login failed, skipping authenticated tests", "WARN")
        else:
            # Authenticated endpoints
            self.log("\n--- Testing Authenticated Endpoints ---", "INFO")
            self.test_list_leads()
            
            if lead_id:
                self.test_update_lead(lead_id)
            
            # Get first home ID for update test
            _, homes = self.test_homes_list()
            if homes and len(homes) > 0:
                home_id = homes[0].get('id')
                if home_id:
                    self.test_update_home(home_id)
            
            self.test_update_site_settings()
            self.test_create_and_delete_faq()
        
        # Print summary
        self.log("\n" + "=" * 60, "INFO")
        self.log("Test Summary", "INFO")
        self.log("=" * 60, "INFO")
        self.log(f"Total Tests: {self.tests_run}", "INFO")
        self.log(f"Passed: {self.tests_passed}", "PASS")
        self.log(f"Failed: {len(self.failed_tests)}", "FAIL")
        
        if self.failed_tests:
            self.log("\nFailed Tests:", "FAIL")
            for test in self.failed_tests:
                error_msg = test.get('error', f"Expected {test.get('expected')}, got {test.get('actual')}")
                self.log(f"  - {test['name']}: {error_msg} [{test['endpoint']}]", "FAIL")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        self.log(f"\nSuccess Rate: {success_rate:.1f}%", "INFO")
        
        return 0 if len(self.failed_tests) == 0 else 1


def main():
    tester = ConstructONSAPITester()
    return tester.run_all_tests()


if __name__ == "__main__":
    sys.exit(main())
