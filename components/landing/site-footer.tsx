import Link from "next/link";
import { Logo } from "@/components/brand/logo";

const FOOTER_LINKS = {
  Produto: ["Recursos", "Como funciona", "Para igrejas"],
  Empresa: ["Sobre", "Contato"],
  Legal: ["Termos de uso", "Privacidade"],
};

function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="container py-14">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Plataforma digital para igrejas, ministérios e equipes de
              comunicação organizarem tudo em um só lugar.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <p className="text-sm font-semibold text-foreground">{section}</p>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CHURCH-LAB. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground">Feito com propósito, para igrejas.</p>
        </div>
      </div>
    </footer>
  );
}

export { SiteFooter };
