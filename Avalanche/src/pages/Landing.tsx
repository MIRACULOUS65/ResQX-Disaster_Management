import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useUser, SignInButton, UserButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { 
  Shield, 
  Users, 
  Radar, 
  Star, 
  Info, 
  ArrowDown,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DisasterMapModal from "@/components/DisasterMapModal";
import DisasterAlertModal from "../components/DisasterAlertModal";
import NotificationThemeModal from "../components/NotificationThemeModal";
import NotificationThemeDemo from "@/components/NotificationThemeDemo";

export default function Landing() {
  // Check if Clerk is available
  const isClerkAvailable = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const { isSignedIn } = isClerkAvailable ? useUser() : { isSignedIn: false };
  const navigate = useNavigate();
  const [isDisasterMapOpen, setIsDisasterMapOpen] = useState(false);
  const [isDisasterAlertOpen, setIsDisasterAlertOpen] = useState(false);
  const [isNotificationThemeOpen, setIsNotificationThemeOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };


  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div 
              whileHover={{ scale: 1.04 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="text-2xl font-bold tracking-tight cursor-pointer"
              onClick={() => scrollToSection('hero')}
            >
              DS
            </motion.div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              {[
                { label: "Home", id: "hero" },
                { label: "Rescue Team", id: "rescue-team", isDropdown: true },
                { label: "Disaster Radar", id: "disaster-radar", isDropdown: true },
                { label: "Features", id: "features", isDropdown: true },
                { label: "About", id: "about" },
              ].map((item) => (
                <div key={item.id}>
                  {item.isDropdown ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <motion.button
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ type: "spring", stiffness: 300, damping: 18 }}
                          className="relative text-foreground hover:text-primary transition-colors font-medium flex items-center gap-1"
                        >
                          {item.label}
                          <ChevronDown className="h-4 w-4" />
                        </motion.button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-40">
                        {item.id === 'rescue-team' ? (
                          <>
                            <DropdownMenuItem>Option 1</DropdownMenuItem>
                            <DropdownMenuItem>Option 2</DropdownMenuItem>
                            <DropdownMenuItem>Option 3</DropdownMenuItem>
                          </>
                        ) : item.id === 'disaster-radar' ? (
                          <>
                            <DropdownMenuItem onClick={() => setIsDisasterMapOpen(true)}>
                              Disaster MAP
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setIsDisasterAlertOpen(true)}>
                              Disaster Alert System
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setIsNotificationThemeOpen(true)}>
                              Notification Theme Customizer
                            </DropdownMenuItem>
                            <DropdownMenuItem>Option 4</DropdownMenuItem>
                          </>
                        ) : item.id === 'features' ? (
                          <>
                            <DropdownMenuItem>Option 1</DropdownMenuItem>
                            <DropdownMenuItem>Option 2</DropdownMenuItem>
                            <DropdownMenuItem>Option 3</DropdownMenuItem>
                          </>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <motion.button
                      onClick={() => scrollToSection(item.id)}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 300, damping: 18 }}
                      className="relative text-foreground hover:text-primary transition-colors font-medium"
                    >
                      {item.label}
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute left-0 -bottom-1 h-[2px] w-full bg-primary origin-left scale-x-0"
                        whileHover={{ scaleX: 1 }}
                      />
                    </motion.button>
                  )}
                </div>
              ))}
            </div>

            {/* Sign In Button / Profile */}
            <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
              {isClerkAvailable ? (
                isSignedIn ? (
                  <div className="flex items-center gap-3">
                    <Button 
                      onClick={() => navigate('/dashboard')}
                      variant="outline"
                      className="font-medium px-4"
                    >
                      Dashboard
                    </Button>
                    <UserButton 
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: "w-10 h-10"
                        }
                      }}
                    />
                  </div>
                ) : (
                  <SignInButton mode="modal" fallbackRedirectUrl="/">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6">
                      Sign In
                    </Button>
                  </SignInButton>
                )
              ) : (
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={() => navigate('/dashboard')}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6"
                  >
                    Go to Dashboard
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    (Auth not configured)
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section id="hero" className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-32">
            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight"
            >
              Protecting Lives Through
              <br />
              <span className="text-primary">Smart Disaster Management</span>
            </motion.h1>
            
            <motion.p 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              "When disaster strikes, every second counts. Our advanced technology and dedicated teams ensure rapid response and effective coordination to save lives and minimize damage."
            </motion.p>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={() => scrollToSection('discover')}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 py-4 text-lg"
                >
                  Discover How
                  <ArrowDown className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Discover Section */}
      <section id="discover" className="py-32 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              How We Make a Difference
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our comprehensive disaster management platform combines cutting-edge technology with human expertise to deliver unparalleled emergency response capabilities.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: Shield,
                title: "Real-time Monitoring",
                description: "24/7 surveillance systems track potential threats and environmental changes to provide early warning alerts."
              },
              {
                icon: Users,
                title: "Expert Response Teams",
                description: "Highly trained professionals ready to deploy at a moment's notice with specialized equipment and protocols."
              },
              {
                icon: Radar,
                title: "Advanced Analytics",
                description: "AI-powered prediction models analyze data patterns to forecast disasters and optimize response strategies."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center p-8 rounded-2xl bg-background border border-border hover:shadow-lg transition-all duration-300"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <item.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Rescue Team Section */}
      <section id="rescue-team" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Elite Rescue Teams
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our specialized rescue teams are equipped with state-of-the-art technology and undergo rigorous training to handle any emergency situation with precision and care.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="space-y-8">
                {[
                  "Rapid deployment within 15 minutes",
                  "Advanced search and rescue equipment",
                  "Medical emergency response capabilities",
                  "Multi-terrain operation expertise"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="text-lg">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-muted/30 rounded-3xl p-12 text-center"
            >
              <Users className="h-24 w-24 text-primary mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-4">24/7 Availability</h3>
              <p className="text-muted-foreground">
                Our teams are always ready to respond, ensuring help arrives when you need it most.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Disaster Radar Section */}
      <section id="disaster-radar" className="py-32 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Disaster Radar System
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our advanced radar network provides real-time tracking and early warning systems for natural disasters, giving communities precious time to prepare and evacuate.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-background rounded-3xl p-12 text-center border border-border"
            >
              <Radar className="h-24 w-24 text-primary mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-4">Predictive Analytics</h3>
              <p className="text-muted-foreground">
                AI-powered systems analyze weather patterns and geological data to predict potential disasters hours or days in advance.
              </p>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="space-y-8">
                {[
                  "Earthquake detection and monitoring",
                  "Severe weather tracking systems",
                  "Flood risk assessment tools",
                  "Wildfire spread prediction models"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="text-lg">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Platform Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive tools and capabilities designed to streamline disaster management operations and improve emergency response effectiveness.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[
              {
                icon: Shield,
                title: "Emergency Alerts",
                description: "Instant notifications to affected populations"
              },
              {
                icon: Users,
                title: "Resource Management",
                description: "Efficient allocation of personnel and equipment"
              },
              {
                icon: Radar,
                title: "Communication Hub",
                description: "Centralized coordination between agencies"
              },
              {
                icon: Star,
                title: "Recovery Planning",
                description: "Post-disaster rehabilitation strategies"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              About Our Mission
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Founded with the vision of creating safer communities, we leverage cutting-edge technology and human expertise to revolutionize disaster management. Our commitment extends beyond emergency response to building resilient societies that can withstand and recover from natural disasters.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                number: "10M+",
                label: "Lives Protected",
                description: "People covered by our monitoring systems"
              },
              {
                number: "500+",
                label: "Response Teams",
                description: "Trained professionals ready to deploy"
              },
              {
                number: "99.9%",
                label: "System Uptime",
                description: "Reliable monitoring and alert systems"
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-xl font-semibold mb-2">{stat.label}</div>
                <div className="text-muted-foreground">{stat.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Company Info */}
            <div>
              <div className="text-2xl font-bold mb-4">DS</div>
              <p className="text-muted-foreground mb-6">
                Leading the future of disaster management through innovation and dedication.
              </p>
              <div className="flex space-x-4">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Icon className="h-5 w-5" />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-3">
                {['Home', 'Rescue Team', 'Disaster Radar', 'Features', 'About'].map((link) => (
                  <button key={link} className="block text-muted-foreground hover:text-foreground transition-colors">
                    {link}
                  </button>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <div className="space-y-3">
                {['Emergency Response', 'Risk Assessment', 'Training Programs', 'Consultation', 'Support'].map((service) => (
                  <div key={service} className="text-muted-foreground">{service}</div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">contact@ds.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Emergency Operations Center</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 DS - Disaster Management Solutions. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Disaster Map Modal */}
      <DisasterMapModal 
        isOpen={isDisasterMapOpen} 
        onClose={() => setIsDisasterMapOpen(false)} 
      />

      {/* Disaster Alert System Modal */}
      <DisasterAlertModal 
        isOpen={isDisasterAlertOpen} 
        onClose={() => setIsDisasterAlertOpen(false)} 
      />

      {/* Notification Theme Customizer Modal */}
      <NotificationThemeModal 
        isOpen={isNotificationThemeOpen} 
        onClose={() => setIsNotificationThemeOpen(false)} 
      />
    </div>
  );
}