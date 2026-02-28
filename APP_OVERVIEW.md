# Casa Direta (ImoPonto) - Application Overview 🏠

## Main Goal

**Casa Direta** (also branded as **ImoPonto**) is a **commission-free real estate platform** designed for the Portuguese market. The main goal is to **empower property owners to sell their properties directly to buyers without paying traditional real estate agency commissions** (typically 5% + VAT, which can amount to €18,450 on a €300,000 property).

The platform acts as a **marketplace and toolset** that connects property sellers, buyers, and verified professionals (lawyers, notaries, photographers, etc.) while giving users complete control over the selling process.

---

## Core Functionalities

### 1. Property Listings & Search 🔍

- **Create & Publish Listings**: Users can create detailed property listings with photos, descriptions, pricing, and location data
- **Advanced Search**: Filter properties by location, type, price range, bedrooms, bathrooms, and area
- **Property Details**: Comprehensive property pages with image galleries, descriptions, and contact options
- **Map Integration**: Interactive maps (Mapbox) to visualize property locations
- **Favorites System**: Users can save and track properties they're interested in

**Key Pages**:
- `/imoveis` - Property search and browse
- `/imovel/:id` - Individual property details
- `/criar-anuncio` - Create new listing
- `/editar-anuncio/:id` - Edit existing listing
- `/meus-imoveis` - Manage user's properties
- `/favoritos` - Saved favorite properties

### 2. User Management 👤

- **Authentication**: Secure user registration and login via Supabase Auth
- **User Profiles**: Personal profiles with contact information and preferences
- **My Properties**: Dashboard to manage all owned property listings
- **Settings**: Account configuration and preferences management

**Key Pages**:
- `/auth` - Login and registration
- `/meu-perfil` - User profile management
- `/definicoes` - Account settings

### 3. Digital Vault (Cofre Digital) 📁

- **Document Storage**: Secure cloud storage for property-related documents
- **Document Management**: Upload, organize, and manage property documentation
- **Access Control**: Control who can view specific documents
- **Professional Access Requests**: Verified professionals can request paid access to documents (€10 fee)

**Key Pages**:
- `/documentos` - Digital vault document management

**Database Tables**:
- `vault_documents` - Stores document metadata and file references
- `vault_access_requests` - Manages professional access requests

### 4. Professional Services Marketplace 🏢

Four main categories of verified professionals:

#### Legal Services (Jurídico)
- Real estate lawyers (Advogados Imobiliários)
- Notaries (Notários)

#### Financial Services (Financeiro)
- Mortgage brokers (Intermediação de Crédito)

#### Technical Services (Técnico)
- Energy certification (Certificação Energética)
- Property appraisal (Avaliação Imobiliária)

#### Marketing Services
- Professional photography and virtual tours

**Features**:
- Professional profiles with ratings and reviews
- Contact request system
- Service pricing transparency
- Verification badges for trusted professionals

**Key Pages**:
- `/servicos` - Browse professional services
- `/profissional/:id` - Individual professional profile

**Database Tables**:
- `professionals` - Professional service provider profiles
- `professional_reviews` - Ratings and reviews
- `contact_requests` - User-professional communication
- `service_category` enum: 'juridico', 'financeiro', 'tecnico', 'marketing'

### 5. Professional Panel 💼

For users who become verified professionals:

- Manage professional profile
- View and respond to contact requests
- Access vault document requests
- Track reviews and ratings
- Professional dashboard with analytics

**Key Pages**:
- `/tornar-profissional` - Become a professional
- `/completar-perfil-profissional` - Complete professional profile setup
- `/painel-profissional` - Professional dashboard

### 6. Commission-Free Selling Process 💰

A guided 5-step process explained on the platform:

1. **Criação e Preparação** (Creation & Preparation)
   - Create property listing and organize documents in the digital vault
   - Option to publish publicly or manage privately

2. **Visitas e Contactos** (Visits & Contacts)
   - Communicate directly with buyers
   - Schedule viewings through personalized control center

3. **Propostas e Negociação** (Proposals & Negotiation)
   - Receive and compare purchase offers
   - Organized and transparent negotiation process

4. **Formalização Jurídica** (Legal Formalization)
   - Support for CPCV (Contrato Promessa de Compra e Venda - preliminary contract)
   - Deed preparation with verified professionals

5. **Venda Concluída** (Sale Completion)
   - Finalize transaction
   - Hand over keys
   - Celebrate commission savings

**Key Pages**:
- `/sem-comissoes` - Detailed explanation of commission-free selling
- `/publicar` - Listing options and publishing flow
- `/publicar-imovel/:id` - Property publishing workflow

### 7. Messaging & Communication 💬

- **Messaging System**: Direct communication between buyers, sellers, and professionals
- **Notifications**: Real-time notifications for messages, inquiries, and updates
- **Contact Requests**: Structured inquiry system for property listings

**Key Pages**:
- `/mensagens` - Messaging center

**Context**:
- `MessagingContext` - Manages messaging state and real-time updates

### 8. Agenda/Calendar 📅

- Schedule property viewings
- Manage appointments with professionals
- Track important dates in the selling process

**Key Pages**:
- `/agenda` - Calendar and appointment management

### 9. Savings Calculator 🧮

- Interactive tool showing potential commission savings
- Compares traditional agency fees vs. Casa Direta's commission-free model
- Demonstrates real monetary value for users
- Displayed on homepage

**Components**:
- `SavingsCalculator` - Interactive savings calculation widget

---

## Technology Stack

### Frontend

- **React 18.3.1** with TypeScript
- **Vite 5.4.19** for fast development and building
- **React Router 6.30.1** for navigation
- **TanStack Query 5.83.0** for data fetching and caching
- **shadcn/ui** + **Radix UI** for accessible component library
- **Tailwind CSS 3.4.17** for styling
- **Lucide React 0.462.0** for icons
- **Recharts 2.15.4** for data visualization
- **Mapbox GL 3.17.0** for interactive maps
- **React Hook Form 7.61.1** + **Zod 3.25.76** for form validation
- **date-fns 3.6.0** for date manipulation
- **Sonner 1.7.4** for toast notifications

### Backend & Database

- **Supabase** for:
  - PostgreSQL database
  - Authentication (via @supabase/supabase-js 2.89.0)
  - Real-time subscriptions
  - Row Level Security (RLS)
  - File storage

### Key Database Tables

#### Properties & Listings
```sql
properties
  - id (UUID)
  - user_id (UUID)
  - title, address, location
  - price, property_type
  - bedrooms, bathrooms, area
  - description, image_url
  - status (pending/active)
  - views_count, inquiries_count
  - documentation_level
  - created_at, updated_at
```

#### Digital Vault
```sql
vault_documents
  - id (UUID)
  - user_id (UUID)
  - property_id (UUID, FK to properties)
  - name, file_type, file_url, file_size
  - is_public, status
  - created_at, updated_at

vault_access_requests
  - id (UUID)
  - professional_id (UUID, FK to professionals)
  - requester_id (UUID, FK to auth.users)
  - vault_document_id, property_id
  - status (pending/paid/granted/denied/expired)
  - payment_amount (default €10.00)
  - payment_status (unpaid/paid/refunded)
  - message
  - created_at, updated_at
```

#### Professional Services
```sql
professionals
  - id (UUID)
  - user_id (UUID, FK to auth.users)
  - name, email, phone, avatar_url, bio
  - category (enum: juridico/financeiro/tecnico/marketing)
  - service_type
  - price_from
  - location, years_experience
  - is_verified, is_active
  - created_at, updated_at

professional_reviews
  - id (UUID)
  - professional_id (UUID, FK to professionals)
  - user_id (UUID, FK to auth.users)
  - rating (0-5)
  - comment
  - created_at, updated_at
  - UNIQUE constraint on (professional_id, user_id)

contact_requests
  - id (UUID)
  - professional_id (UUID, FK to professionals)
  - user_id (UUID, FK to auth.users)
  - message
  - status (pending/responded/closed)
  - created_at, updated_at
```

### Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Authentication-based access control**
- **User-owned data policies** (users can only modify their own data)
- **Public/private data separation** (active listings visible to all, drafts only to owners)
- **Professional verification system**

---

## Application Structure

### Pages (Routes)

| Route | Component | Access | Description |
|-------|-----------|--------|-------------|
| `/` | Index | Public | Homepage with hero, features, and property showcase |
| `/auth` | Auth | Public | Login and registration |
| `/imoveis` | Search | Public | Property search and browse |
| `/imovel/:id` | PropertyDetail | Public | Individual property details |
| `/publicar` | ListingOptions | Protected | Choose listing type |
| `/publicar-imovel/:id` | PublishProperty | Protected | Publish property workflow |
| `/criar-anuncio` | CreateListing | Protected | Create new property listing |
| `/editar-anuncio/:id` | EditListing | Protected | Edit existing listing |
| `/servicos` | Services | Public | Browse professional services |
| `/sem-comissoes` | SemComissoes | Public | Commission-free selling explanation |
| `/meu-perfil` | MyProfile | Protected | User profile management |
| `/meus-imoveis` | MyProperties | Protected | Manage user's properties |
| `/painel-profissional` | ProfessionalPanel | Protected | Professional dashboard |
| `/favoritos` | Favorites | Protected | Saved favorite properties |
| `/tornar-profissional` | BecomeProfessional | Protected | Become a professional |
| `/definicoes` | Settings | Protected | Account settings |
| `/completar-perfil-profissional` | CompleteProfessionalProfile | Protected | Complete professional profile |
| `/documentos` | MyDocuments | Protected | Digital vault |
| `/mensagens` | Messages | Protected | Messaging center |
| `/agenda` | Agenda | Protected | Calendar and appointments |
| `/profissional/:id` | ProfessionalProfile | Public | View professional profile |

### Key Components

#### Homepage Sections
- `Header` - Navigation and user menu
- `HeroSection` - Main hero with CTA
- `DifferentiationSection` - Platform differentiators
- `SavingsCalculator` - Interactive savings calculator
- `FeaturesSection` - Key features showcase
- `PropertiesSection` - Featured properties
- `ServicesSection` - Professional services preview
- `HowItWorksSection` - Process explanation
- `CTASection` - Call-to-action
- `Footer` - Site footer with links

#### Shared Components
- `PropertyCard` - Property listing card
- `PropertyMap` - Interactive map with Mapbox
- `NotificationBell` - Real-time notifications
- `UserMenu` - User account dropdown
- `ProtectedRoute` - Route authentication wrapper

---

## User Journeys

### Property Seller Journey

1. **Registration & Setup**
   - Register/Login via `/auth`
   - Complete profile at `/meu-perfil`

2. **Create Listing**
   - Navigate to `/publicar` to choose listing type
   - Create property at `/criar-anuncio`
   - Upload photos and details
   - Upload documents to digital vault at `/documentos`

3. **Publish & Manage**
   - Publish listing (or keep private)
   - Monitor views and inquiries at `/meus-imoveis`
   - Respond to buyer messages at `/mensagens`

4. **Schedule & Negotiate**
   - Schedule viewings via `/agenda`
   - Receive and compare offers
   - Negotiate directly with buyers

5. **Professional Services**
   - Browse professionals at `/servicos`
   - Hire lawyer, notary, or other services as needed
   - Grant vault access to professionals

6. **Complete Sale**
   - Finalize CPCV with legal support
   - Complete deed signing
   - Celebrate commission savings (€18,450 on €300k property!)

### Property Buyer Journey

1. **Search & Discover**
   - Browse properties at `/imoveis`
   - Use filters (location, price, type, size)
   - View on map with `PropertyMap`

2. **Save & Compare**
   - Add favorites at `/favoritos`
   - View detailed property pages at `/imovel/:id`
   - Compare multiple properties

3. **Contact & Visit**
   - Contact sellers directly via messaging
   - Schedule viewings
   - Ask questions without intermediaries

4. **Make Offer**
   - Submit purchase proposal
   - Negotiate directly with seller
   - Complete transaction

### Professional Service Provider Journey

1. **Registration**
   - Register account at `/auth`
   - Apply to become professional at `/tornar-profissional`

2. **Profile Setup**
   - Complete professional profile at `/completar-perfil-profissional`
   - Add credentials, experience, pricing
   - Get verified by platform

3. **Receive Requests**
   - Monitor contact requests at `/painel-profissional`
   - Respond to client inquiries
   - Request vault document access (€10 fee)

4. **Provide Services**
   - Deliver professional services
   - Build reputation through reviews
   - Grow client base

---

## Key Differentiators

✅ **Zero Commission Model** - Save thousands on agency fees (5% + VAT = €18,450 on €300k)  
✅ **Direct Communication** - No intermediaries between buyers and sellers  
✅ **Professional Network** - Access to verified professionals when needed  
✅ **Digital Vault** - Secure document management and sharing  
✅ **Full Control** - Users decide who visits, when, and how  
✅ **Transparency** - Clear pricing for all professional services  
✅ **Guided Process** - 5-step framework for commission-free selling  
✅ **Real-time Notifications** - Stay updated on inquiries and messages  

---

## Business Model

The platform generates revenue through:

1. **Professional Access Fees**
   - €10 fee for professionals to access vault documents
   - Ensures serious professional engagement

2. **Professional Service Marketplace**
   - Potential commission on services booked through platform
   - Verified professional network creates value

3. **Premium Features** (potential)
   - Featured listings
   - Enhanced visibility
   - Advanced analytics

4. **Free Core Platform**
   - Basic property listings are free
   - Democratizes real estate selling
   - Removes barrier to entry

---

## Value Proposition

### For Sellers
- **Save €18,450** on a €300,000 property (vs. 5% + VAT agency commission)
- **Full control** over the selling process
- **Direct communication** with buyers
- **Professional support** when needed
- **Secure document management**

### For Buyers
- **Direct access** to property owners
- **No agency pressure** or intermediaries
- **Transparent pricing** and information
- **Wider selection** of properties

### For Professionals
- **New client acquisition** channel
- **Verified marketplace** presence
- **Direct client relationships**
- **Transparent service pricing**
- **Reputation building** through reviews

---

## Technical Highlights

### Performance
- **Vite** for lightning-fast development and builds
- **TanStack Query** for efficient data caching and synchronization
- **Code splitting** with React Router
- **Optimized bundle** with tree-shaking

### User Experience
- **Responsive design** with Tailwind CSS
- **Accessible components** via Radix UI
- **Real-time updates** with Supabase subscriptions
- **Toast notifications** for user feedback
- **Interactive maps** for property visualization

### Security
- **Row Level Security** on all database tables
- **Authentication-based access control**
- **Secure file storage** with Supabase
- **Protected routes** for sensitive pages
- **Data validation** with Zod schemas

### Developer Experience
- **TypeScript** for type safety
- **ESLint** for code quality
- **Component library** with shadcn/ui
- **Form handling** with React Hook Form
- **Modular architecture** with clear separation of concerns

---

## Future Enhancements (Potential)

Based on the codebase structure, potential future features could include:

- **Mobile app** (React Native or PWA)
- **Advanced analytics** for property performance
- **AI-powered pricing** recommendations
- **Virtual tours** and 3D property views
- **Automated legal document** generation
- **Integrated payment** processing
- **Multi-language support** (currently Portuguese)
- **Property comparison** tools
- **Market insights** and trends
- **Referral program** for users

---

## Getting Started

### Prerequisites
- Node.js & npm (or Bun)
- Supabase account
- Mapbox API key

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd casa-direta

# Install dependencies
npm install

# Set up environment variables
# Create .env file with:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - VITE_MAPBOX_TOKEN

# Run development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

Required environment variables:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_MAPBOX_TOKEN` - Mapbox access token

---

## Project Links

- **Lovable Project**: https://lovable.dev/projects/43f2ee99-8482-4100-bb42-248e8c0e1c56
- **Repository**: Local development at `/Users/tiagopereira/Documents/MyRepo/casa-direta`

---

## Summary

**Casa Direta (ImoPonto)** is a comprehensive, modern real estate platform that disrupts the traditional agency model by empowering users with tools, transparency, and direct control. By eliminating commission fees and providing access to verified professionals, the platform creates a win-win ecosystem for property sellers, buyers, and service providers in the Portuguese real estate market.

The application combines cutting-edge web technologies with a user-centric design to deliver a seamless, secure, and cost-effective property transaction experience. 🎯🏠
