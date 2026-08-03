from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import uuid


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def new_id():
    return str(uuid.uuid4())


class BaseDoc(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=new_id)
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)
    sort_order: int = 0
    is_published: bool = True


# ---------- Homes ----------
class FloorPlanArea(BaseModel):
    label: str
    area: str  # e.g. "120 Sq.ft"

class Home(BaseDoc):
    name: str
    slug: str
    style: str = "Modern"  # Modern, Classic, Duplex, Villa, etc.
    area_sqft: str  # display e.g. '1850 Sq.ft'
    dimensions: Optional[str] = None  # e.g. '30\' x 60\''
    bedrooms: int = 3
    bathrooms: int = 3
    floors: int = 1
    parking: int = 1
    estimated_cost: str  # e.g. 'From ₹40.68 Lakhs'
    package_compatibility: List[str] = Field(default_factory=list)  # ['Basic','Essential','Standard','Premium']
    cover_image: str
    gallery: List[str] = Field(default_factory=list)
    floorplan_image: Optional[str] = None
    floor_areas: List[FloorPlanArea] = Field(default_factory=list)
    tagline: Optional[str] = None
    description: Optional[str] = None
    features: List[str] = Field(default_factory=list)
    vastu_compliant: bool = True


# ---------- Packages ----------
class PackageSection(BaseModel):
    title: str  # e.g. 'Materials', 'Specifications', 'Warranty', 'Timeline', 'Quality', 'AI Features'
    items: List[str] = Field(default_factory=list)


class SpecItem(BaseModel):
    """A single row inside a spec category — e.g. 'Cement | UltraTech 53 Grade | 10 Yr | PPC blend'."""
    spec: str  # Label: 'Cement', 'TMT Steel'
    value: str = ""  # 'UltraTech PPC 53 Grade'
    brand: Optional[str] = None  # 'UltraTech'
    warranty: Optional[str] = None  # '10 Years'
    notes: Optional[str] = None


class SpecCategory(BaseModel):
    """A category in the deep spec sheet — e.g. 'Structure & Foundation'."""
    name: str
    icon: Optional[str] = None  # lucide icon
    items: List[SpecItem] = Field(default_factory=list)


class AddOn(BaseModel):
    name: str
    description: str = ""
    price: str  # display, e.g. '₹75,000' or '₹120/Sq.ft'
    unit: Optional[str] = None
    image: Optional[str] = None


class PaymentMilestone(BaseModel):
    milestone: str  # e.g. 'Booking Advance'
    percentage: int = 0
    description: str = ""


class PackageFAQ(BaseModel):
    question: str
    answer: str


class Package(BaseDoc):
    name: str  # 'Basic Package'
    slug: str
    tier: str  # 'basic' | 'essential' | 'standard' | 'premium'
    price_display: str  # '₹1499' or 'Custom Quote'
    price_unit: Optional[str] = "/Sq.ft"
    price_per_sqft: Optional[int] = 0  # numeric for calculator, 0 = custom
    tagline: str = ""
    description: str = ""
    hero_image: Optional[str] = None
    highlights: List[str] = Field(default_factory=list)
    sections: List[PackageSection] = Field(default_factory=list)  # legacy summary
    # New deep systems:
    spec_categories: List[SpecCategory] = Field(default_factory=list)
    scope_of_work: List[str] = Field(default_factory=list)
    exclusions: List[str] = Field(default_factory=list)
    addons: List[AddOn] = Field(default_factory=list)
    payment_schedule: List[PaymentMilestone] = Field(default_factory=list)
    package_faqs: List[PackageFAQ] = Field(default_factory=list)
    timeline_months: Optional[str] = None  # '8–10 months'
    warranty_years: Optional[int] = 1
    min_area_sqft: Optional[int] = 800
    # UI:
    is_most_popular: bool = False
    accent_color: str = "#FF5A00"
    cta_label: str = "View Details"

    # ------------------------------------------------------------------
    # Optional per-section heading overrides.
    # If None, the public page + PDF brochure fall back to the built-in
    # defaults shown next to each field. All are FULLY EDITABLE from the
    # admin panel so admins can rebrand the copy of any package without
    # touching code.
    # ------------------------------------------------------------------
    overview_eyebrow: Optional[str] = None       # default: "Overview"
    overview_title: Optional[str] = None         # default: "Why choose <name>?"
    highlights_eyebrow: Optional[str] = None     # default: "Key Highlights"
    covered_eyebrow: Optional[str] = None        # default: "What's covered"
    specs_eyebrow: Optional[str] = None          # default: "Deep Specifications"
    specs_title: Optional[str] = None            # default: "Every material, brand & spec"
    specs_subtitle: Optional[str] = None         # default: "Full transparency..."
    scope_eyebrow: Optional[str] = None          # default: "Scope of Work"
    scope_title: Optional[str] = None            # default: "What's included"
    exclusions_eyebrow: Optional[str] = None     # default: "Exclusions"
    exclusions_title: Optional[str] = None       # default: "Not included"
    addons_eyebrow: Optional[str] = None         # default: "Add-ons & Upgrades"
    addons_title: Optional[str] = None           # default: "Personalise your home"
    schedule_eyebrow: Optional[str] = None       # default: "Payment Schedule"
    schedule_title: Optional[str] = None         # default: "Milestone-based billing"
    faqs_eyebrow: Optional[str] = None           # default: "Frequently Asked"
    faqs_title: Optional[str] = None             # default: "Questions & answers"


# ---------- Testimonials ----------
class Testimonial(BaseDoc):
    customer_name: str
    location: str = ""
    quote: str
    rating: int = 5
    avatar: Optional[str] = None
    video_url: Optional[str] = None
    home_purchased: Optional[str] = None


# ---------- FAQs ----------
class FAQ(BaseDoc):
    question: str
    answer: str
    category: Optional[str] = "general"


# ---------- Blogs ----------
class Blog(BaseDoc):
    title: str
    slug: str
    excerpt: str = ""
    cover_image: str
    author: str = "ConstructONS Team"
    author_avatar: Optional[str] = None
    read_minutes: int = 5
    tags: List[str] = Field(default_factory=list)
    content_html: str  # simple HTML body
    published_at: Optional[str] = None


# ---------- Marketplace ----------
class MarketplaceCategory(BaseDoc):
    name: str  # Materials, Equipment, ...
    slug: str
    description: str = ""
    image: str
    icon: Optional[str] = None  # lucide icon name
    coming_soon: bool = False


# ---------- Financial Services ----------
class FinancialService(BaseDoc):
    name: str  # PayLater, Loans, Insurance, Payment Gateway
    slug: str
    tagline: str = ""
    description: str = ""
    icon: Optional[str] = None
    features: List[str] = Field(default_factory=list)
    coming_soon: bool = False


# ---------- Team ----------
class TeamMember(BaseDoc):
    name: str
    role: str
    photo: str
    bio: Optional[str] = ""
    linkedin: Optional[str] = None


# ---------- AI Platform Modules ----------
class AIPlatformModule(BaseDoc):
    name: str  # 'AI Workspace', 'Project Management', ...
    slug: str
    tagline: str = ""
    icon: Optional[str] = None
    description: str = ""


# ---------- Journey Steps ----------
class JourneyStep(BaseDoc):
    step_no: int = 1
    name: str  # Choose Home
    description: str = ""
    icon: Optional[str] = None


# ---------- Hero Sections ----------
class HeroSection(BaseDoc):
    key: str  # e.g. 'home_hero'
    eyebrow: Optional[str] = None
    headline: str
    headline_highlight: Optional[str] = None  # part to color
    subheading: str
    background_image: str
    primary_cta_label: str = "Explore Home Collection"
    primary_cta_link: str = "#home-collection"
    secondary_cta_label: str = "Get Free Consultation"
    secondary_cta_link: str = "#contact"
    stats: List[Dict[str, Any]] = Field(default_factory=list)  # [{label,value}]


# ---------- Media / Gallery ----------
class MediaItem(BaseDoc):
    title: str = ""
    url: str
    category: str = "general"  # 'banner','gallery','dashboard', etc.
    alt: Optional[str] = None


# ---------- Comparison ----------
class ComparisonRow(BaseDoc):
    feature: str  # 'Transparent Pricing'
    traditional: str = "No"
    constructons: str = "Yes"
    traditional_positive: bool = False
    constructons_positive: bool = True


# ---------- Stats ----------
class StatItem(BaseDoc):
    label: str
    value: str  # e.g. '250+'
    icon: Optional[str] = None


# ---------- Contact / Site Settings (singleton via key) ----------
class SiteSettings(BaseModel):
    id: str = "site_settings"
    company_name: str = "ConstructONS"
    tagline: str = "Everything Construction. Always On."
    logo_url: Optional[str] = None
    phone: str = "+91 98765 43210"
    whatsapp: str = "+91 98765 43210"
    email: str = "hello@constructons.in"
    address: str = "Bangalore, Karnataka, India"
    google_maps_embed: Optional[str] = None
    social_links: Dict[str, str] = Field(default_factory=dict)
    footer_note: str = "Made with love in India"


# ---------- Leads ----------
class LeadCreate(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    city: Optional[str] = None
    interested_home: Optional[str] = None
    interested_package: Optional[str] = None
    message: Optional[str] = None
    source: str = "website"  # 'hero','contact','home_detail','packages'
    quiz_submission_id: Optional[str] = None

class Lead(BaseDoc):
    name: str
    phone: str
    email: Optional[str] = None
    city: Optional[str] = None
    interested_home: Optional[str] = None
    interested_package: Optional[str] = None
    message: Optional[str] = None
    source: str = "website"
    status: str = "new"  # 'new','contacted','closed'
    quote_ref: Optional[str] = None
    quiz_submission_id: Optional[str] = None


# ---------- Quiz Submissions ----------
class QuizSubmission(BaseDoc):
    budget: str  # 'value'|'balanced'|'premium'|'luxury'
    family_size: str  # '1-2'|'3-4'|'5+'
    style: Optional[str] = None
    smart_home: str = "no"
    recommended_package_slug: Optional[str] = None
    recommended_package_name: Optional[str] = None
    shortlisted_home_slugs: List[str] = Field(default_factory=list)
    shortlisted_home_names: List[str] = Field(default_factory=list)
    score: Optional[int] = None
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    contact_city: Optional[str] = None
    converted_to_lead_id: Optional[str] = None
    status: str = "new"  # 'new' | 'contact_captured' | 'converted' | 'closed'
    notes: Optional[str] = None
    source: str = "website"


# ---------- Admin Users (DB-backed authentication) ----------
class AdminUser(BaseDoc):
    email: str
    password_hash: str
    role: str = "admin"
    name: Optional[str] = None
    is_active: bool = True


# ---------- Client Proposals ----------
class ProposalAddon(BaseModel):
    name: str
    price: float = 0
    unit: Optional[str] = None
    description: Optional[str] = None


class Proposal(BaseDoc):
    # Reference & workflow
    ref_number: Optional[str] = None            # auto-generated CON-YYYY-NNNN on create
    status: str = "draft"                       # draft | sent | accepted | rejected
    valid_days: int = 30

    # Client
    client_name: str
    client_phone: str
    client_email: Optional[str] = None
    client_address: Optional[str] = None

    # Site / project
    site_address: Optional[str] = None
    plot_area: Optional[float] = None           # in sq.ft
    floors: Optional[str] = None                # "G+1", "G+2", etc
    built_up_area: float = 1000                 # in sq.ft — used for price calculations
    expected_start: Optional[str] = None
    expected_completion: Optional[str] = None

    # Package snapshot
    package_slug: str
    package_name: Optional[str] = None
    package_price_per_sqft: Optional[float] = None
    package_timeline: Optional[str] = None
    package_warranty_years: Optional[int] = None

    # Add-ons picked from the package's addons list (or custom)
    addons_selected: List[ProposalAddon] = Field(default_factory=list)

    # Pricing overrides / adjustments
    discount_label: Optional[str] = None        # e.g. "Diwali offer"
    discount_amount: float = 0                  # flat rupees off
    gst_percent: float = 18

    # Editable content — pre-filled from the selected package but overridable per proposal
    intro_note: Optional[str] = None
    scope_of_work: List[str] = Field(default_factory=list)
    exclusions: List[str] = Field(default_factory=list)
    payment_schedule: List[Dict[str, Any]] = Field(default_factory=list)  # {milestone,percentage,description}
    terms: Optional[str] = None

    # Linkage
    lead_id: Optional[str] = None
    prepared_by: Optional[str] = None
