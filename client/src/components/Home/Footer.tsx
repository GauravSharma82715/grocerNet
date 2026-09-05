import { BikeIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { footerData } from "../../assets/assets";

const Footer = () => {
  return (
    <footer className="bg-[#0e1b13] text-zinc-300 border-t border-[#1d3526]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Top Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="size-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex-center text-black shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <BikeIcon size={20} className="text-black stroke-[2.5]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                Grocer<span className="text-orange-400">Net</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-5 font-light">
              {footerData.brand.description}
            </p>
            <div className="flex gap-2.5">
              {footerData.brand.socials.map((social, i) => (
                <a
                  key={i}
                  href={social.link}
                  className="size-9 rounded-xl bg-[#162a1e] border border-[#244230] flex-center hover:bg-emerald-500/20 hover:text-emerald-400 text-zinc-300 transition-colors"
                >
                  <social.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {footerData.sections.map((section, i) => (
            <div key={i}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link, j) => (
                  <li key={j}>
                    {link.to ? (
                      <Link
                        to={link.to}
                        className="text-xs sm:text-sm text-zinc-300 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-xs sm:text-sm text-zinc-300 hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              {footerData.contact.map((item, i) => {
                const Icon = item.icon;
                return (
                  <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-zinc-300 font-light">
                    <Icon className="size-4.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#1a3224] mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-400">
          <p>{footerData.bottom.copyright}</p>
          <div className="flex gap-6">
            {footerData.bottom.links.map((link, i) => (
              <a
                key={i}
                href={link.href}
                className="hover:text-zinc-200 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
