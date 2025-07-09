
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowRight, Ruler, ShoppingBag, Shirt, FileText } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";

export default function HomePage() {
  const { user } = useAuth();

  const featuredServices = [
    {
      title: "Custom Measurements",
      description:
        "Get the perfect fit with our precise measurement system. Save and update your measurements for future orders.",
      icon: Ruler,
      link: "/measurements",
    },
    {
      title: "Quality Products",
      description:
        "Browse our collection of high-quality garments designed for comfort and durability.",
      icon: Shirt,
      link: "/products",
    },
    {
      title: "Easy Ordering",
      description:
        "Streamlined ordering process for individuals and organizations. Track your orders with ease.",
      icon: ShoppingBag,
      link: "/products",
    },
    {
      title: "Detailed Records",
      description:
        "Access your order history and measurement records anytime. Make updates as needed.",
      icon: FileText,
      link: "/orders",
    },
  ];

  return (
    <MainLayout requireAuth={false}>
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 text-gray-900 leading-tight animate-enter">
              Premium Garments Tailored to Your Needs
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {user
                ? `Welcome back, ${user.name}! Continue your tailoring journey with us.`
                : "Experience the perfect fit with our professional tailoring services for individuals and organizations."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="text-base px-6">
                <Link to="/products">Browse Products</Link>
              </Button>
              {!user && (
                <Button asChild variant="outline" size="lg" className="text-base px-6">
                  <Link to="/login-type">Get Started</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto mb-12 text-center">
            <h2 className="text-3xl font-display font-bold mb-4 text-gray-900">
              Our Services
            </h2>
            <p className="text-gray-600">
              Experience premium tailoring services designed for both individuals and organizations.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredServices.map((service, index) => (
              <Card key={index} className="card-hover">
                <CardContent className="p-6">
                  <div className="mb-4 bg-blue-100 p-3 w-12 h-12 rounded-lg flex items-center justify-center">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <Link
                    to={service.link}
                    className="text-primary font-medium flex items-center hover:underline"
                  >
                    Learn more <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tailored Solutions Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-display font-bold mb-4 text-gray-900">
                  Tailored Solutions for Every Need
                </h2>
                <p className="text-gray-600 mb-6">
                  Whether you're an individual looking for the perfect fit or an organization needing uniforms for your team, NandhaGarments has you covered.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-2 rounded-full mr-4">
                      <svg className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">School Uniforms</h3>
                      <p className="text-sm text-gray-600">High-quality uniforms for educational institutions.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-2 rounded-full mr-4">
                      <svg className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Corporate Attire</h3>
                      <p className="text-sm text-gray-600">Professional wear for your business and employees.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-2 rounded-full mr-4">
                      <svg className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Sports Uniforms</h3>
                      <p className="text-sm text-gray-600">Comfortable and durable attire for athletic activities.</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <Button asChild>
                    <Link to="/products">Explore Our Collection</Link>
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="bg-blue-100 rounded-lg p-8 relative z-10">
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-medium mb-4">Quick Registration</h3>
                    <p className="text-gray-600 mb-4">
                      Get started with NandhaGarments today and experience premium garment services.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-medium mr-3">
                          1
                        </div>
                        <span>Create an account</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-medium mr-3">
                          2
                        </div>
                        <span>Save your measurements</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-medium mr-3">
                          3
                        </div>
                        <span>Place your orders with ease</span>
                      </div>
                    </div>
                    <div className="mt-6">
                      <Button asChild variant="outline" className="w-full">
                        <Link to="/login-type">Register Now</Link>
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-full h-full bg-primary/10 rounded-lg -z-0"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-display font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join NandhaGarments today and experience the perfect fit for all your garment needs.
          </p>
          <Button asChild variant="secondary" size="lg">
            <Link to="/login-type">Create Your Account</Link>
          </Button>
        </div>
      </section>
    </MainLayout>
  );
}
