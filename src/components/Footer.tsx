import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#222] text-white py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Newsletter */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-semibold mb-4">Stay in touch</h3>
            <p className="text-white/70 mb-4">
              Get the latest updates on new materials, features, and design tips.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              <Button className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white rounded-full px-6">
                Subscribe
              </Button>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-white/70">
              <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="/careers" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="/blog" className="hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-white/70">
              <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/cookie" className="hover:text-white transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Social Icons */}
        <div className="flex items-center justify-between pt-8 border-t border-white/20">
          <div className="flex items-center gap-6">
            <a href="#" aria-label="Facebook" className="text-white/70 hover:text-white transition-colors">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Twitter" className="text-white/70 hover:text-white transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Instagram" className="text-white/70 hover:text-white transition-colors">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" aria-label="LinkedIn" className="text-white/70 hover:text-white transition-colors">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Email" className="text-white/70 hover:text-white transition-colors">
              <Mail className="h-5 w-5" />
            </a>
          </div>

        </div>

        {/* Trust Badge & Powered By */}
        <div className="mt-8 pt-8 border-t border-white/20 flex items-center justify-between text-sm text-white/50">
          <div className="flex items-center gap-4">
            <span>🔒 Secure checkout</span>
          </div>
          <p>Powered by <span className="text-[#FF6B35]">nazaraa</span></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

