import { Home, Facebook, Instagram, Linkedin, Twitter, Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  Plataforma: [
    { label: "Planos Vendedores", href: "/planos" },
    { label: "Planos Profissionais", href: "/planos-profissionais" },
  ],
  Serviços: [
    { label: "Advogados", href: "/servicos?categoria=juridico" },
    { label: "Notários", href: "/servicos?categoria=juridico" },
    { label: "Certificação Energética", href: "/servicos?categoria=tecnico" },
    { label: "Crédito Habitação", href: "/servicos?categoria=financeiro" },
  ],
  Empresa: [
    { label: "Sobre Nós", href: "/sobre-nos" },
    { label: "Carreiras", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Contactos", href: "/contactos" },
  ],
  Legal: [
    { label: "Termos e Condições", href: "/termos-servico" },
    { label: "Política de Privacidade", href: "/politica-privacidade" },
    { label: "RGPD", href: "/rgpd" },
    { label: "Cookies", href: "/cookies" },
  ],
};

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="col-span-2">
            <a href="/" className="flex items-center gap-2 mb-4 overflow-hidden max-h-24">
              <img src="/logo.png" alt="ImoPonto" className="h-48 md:h-64 w-auto object-contain -my-12 md:-my-16" />
            </a>
            <p className="text-primary-foreground/70 mb-6 max-w-xs">
              A plataforma que está a revolucionar o mercado imobiliário em Portugal. Compre e venda sem comissões.
            </p>

            {/* Contact Info */}
            <div className="space-y-2 text-sm text-primary-foreground/70">
              <a href="mailto:info@imoponto.pt" className="flex items-center gap-2 hover:text-accent transition-colors">
                <Mail className="w-4 h-4" />
                info@imoponto.pt
              </a>
              <a href="tel:+351210000000" className="flex items-center gap-2 hover:text-accent transition-colors">
                <Phone className="w-4 h-4" />
                +351 210 000 000
              </a>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Lisboa, Portugal
              </p>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} ImoPonto. Todos os direitos reservados.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {[
              { icon: Facebook, href: "#", name: "facebook" },
              { icon: Instagram, href: "#", name: "instagram" },
              { icon: Linkedin, href: "#", name: "linkedin" },
              { icon: Twitter, href: "#", name: "twitter" },
            ].map(({ icon: Icon, href, name }) => (
              <a
                key={name}
                href={href}
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all"
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
