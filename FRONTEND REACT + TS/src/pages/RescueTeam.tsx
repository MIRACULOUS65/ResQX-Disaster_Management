import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Shield, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowLeft,
  Star,
  Award,
  Target,
  Heart,
  Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function RescueTeam() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleBack}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
              <div className="text-4xl font-bold tracking-tight text-red-600">
                ResQX
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center py-20"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
              Elite <span className="text-primary">Rescue Teams</span>
            </h1>
            
            <motion.p 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed"
            >
              Our specialized rescue teams are equipped with state-of-the-art technology and undergo rigorous training to handle any emergency situation with precision and care.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Team Capabilities */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Team Capabilities
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our rescue teams are trained to handle diverse emergency scenarios with specialized equipment and protocols.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: "Rapid Response",
                description: "Deployment within 15 minutes of emergency call",
                features: ["24/7 availability", "Quick mobilization", "Real-time coordination"]
              },
              {
                icon: Shield,
                title: "Search & Rescue",
                description: "Advanced equipment for locating and extracting victims",
                features: ["Thermal imaging", "Search dogs", "Specialized tools"]
              },
              {
                icon: Heart,
                title: "Medical Emergency",
                description: "On-site medical treatment and stabilization",
                features: ["Trauma care", "Emergency surgery", "Medical transport"]
              },
              {
                icon: MapPin,
                title: "Multi-Terrain",
                description: "Operations in any environment or condition",
                features: ["Urban rescue", "Wilderness operations", "Water rescue"]
              },
              {
                icon: Zap,
                title: "Technical Rescue",
                description: "Complex extraction from confined spaces",
                features: ["Rope rescue", "Confined space", "High-angle rescue"]
              },
              {
                icon: Target,
                title: "Disaster Response",
                description: "Large-scale emergency coordination",
                features: ["Mass casualty", "Evacuation", "Resource management"]
              }
            ].map((capability, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-background rounded-2xl p-8 border border-border hover:shadow-lg transition-all duration-300"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <capability.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{capability.title}</h3>
                <p className="text-muted-foreground mb-6">{capability.description}</p>
                <ul className="space-y-2">
                  {capability.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Statistics */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Our Track Record
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Numbers that speak to our commitment and effectiveness in emergency response.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                number: "500+",
                label: "Trained Professionals",
                description: "Certified rescue specialists"
              },
              {
                number: "15min",
                label: "Average Response Time",
                description: "From call to deployment"
              },
              {
                number: "10,000+",
                label: "Lives Saved",
                description: "Successful rescue operations"
              },
              {
                number: "99.8%",
                label: "Success Rate",
                description: "Mission completion rate"
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
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

      {/* Training & Certification */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Rigorous Training Program
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Our rescue teams undergo extensive training and certification to ensure they're prepared for any emergency scenario.
              </p>
              <div className="space-y-6">
                {[
                  "Advanced first aid and medical training",
                  "Specialized equipment operation",
                  "Team coordination and communication",
                  "Stress management and decision making",
                  "Regular simulation exercises",
                  "Continuous skill assessment"
                ].map((training, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="text-lg">{training}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-background rounded-3xl p-12 text-center border border-border"
            >
              <Award className="h-24 w-24 text-primary mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-4">Certified Excellence</h3>
              <p className="text-muted-foreground mb-6">
                All team members hold international certifications in emergency response and rescue operations.
              </p>
              <div className="flex justify-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">100%</div>
                  <div className="text-sm text-muted-foreground">Certified</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">5★</div>
                  <div className="text-sm text-muted-foreground">Rated</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Emergency */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Emergency Contact
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              In case of emergency, our rescue teams are ready to respond immediately. Contact us through any of these channels.
            </p>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-background rounded-2xl p-8 border border-border hover:shadow-lg transition-all duration-300"
              >
                <Phone className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Emergency Hotline</h3>
                <p className="text-2xl font-bold text-primary mb-2">911</p>
                <p className="text-muted-foreground">24/7 emergency response</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-background rounded-2xl p-8 border border-border hover:shadow-lg transition-all duration-300"
              >
                <Phone className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Direct Line</h3>
                <p className="text-2xl font-bold text-primary mb-2">+1 (555) 911-RESCUE</p>
                <p className="text-muted-foreground">Direct to rescue coordination</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-background rounded-2xl p-8 border border-border hover:shadow-lg transition-all duration-300"
              >
                <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Email Alert</h3>
                <p className="text-lg font-bold text-primary mb-2">emergency@resqx.com</p>
                <p className="text-muted-foreground">Non-urgent emergency reports</p>
              </motion.div>
            </div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-12"
            >
              <Button 
                onClick={handleBack}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 py-4 text-lg"
              >
                Return to Homepage
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-2xl font-bold mb-4">ResQX</div>
          <p className="text-muted-foreground mb-6">
            Leading the future of disaster management through innovation and dedication.
          </p>
          <div className="border-t border-border pt-8 text-muted-foreground">
            <p>&copy; 2025 QuantumGlitch. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
