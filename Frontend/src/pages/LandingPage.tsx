import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  MessageCircle,
  Shield,
  Zap,
  Users,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import axios from "axios";
import { login, logout } from "@/store/authSlice";

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const dispatch = useDispatch();
  const isUserAuthenticated = useSelector(
    (state: RootState) => state.auth.status
  );

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/me`, {
        withCredentials: true,
      })
      .then((response) => {
        dispatch(login(response.data.user));
      })
      .catch((err) => {
        console.log("Error : ", err);
        dispatch(logout());
      })
      .finally(() => {
        setIsVisible(true);
      });
  }, []);

  if (!isVisible) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary border-solid"></div>
          <p className="mt-4 text-lg font-medium text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header isAuthenticated={isUserAuthenticated} />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-background to-secondary/10 pt-16 pb-20 md:pt-24 md:pb-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
              <div
                className={`space-y-6 ${
                  isVisible
                    ? "animate-in fade-in slide-in-from-left-10 duration-700"
                    : "opacity-0"
                }`}
              >
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm">
                  <span className="font-medium">New Features Available</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  Connect & Chat <br />
                  <span className="text-primary">Anytime, Anywhere</span>
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed dark:text-gray-400">
                  Experience the future of communication with our intuitive chat
                  platform. Connect with friends, share moments, and stay in
                  touch effortlessly.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link to="/signup">
                    <Button size="lg" className="group">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link to="#features">
                    <Button size="lg" variant="outline">
                      Learn More
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Free to use</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>End-to-end encrypted</span>
                  </div>
                </div>
              </div>
              <div
                className={`relative rounded-lg border bg-background p-2 ${
                  isVisible
                    ? "animate-in fade-in slide-in-from-right-10 duration-700 delay-300"
                    : "opacity-0"
                }`}
              >
                <div className="rounded-md bg-muted aspect-[16/9] overflow-hidden">
                  <img
                    src="https://images.pexels.com/photos/4348401/pexels-photo-4348401.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                    alt="Chat application screenshot"
                    className="object-cover w-full h-full"
                    width={800}
                    height={450}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Why Choose ChatConnect?
              </h2>
              <p className="mt-4 text-muted-foreground md:text-xl/relaxed">
                Our platform offers everything you need for seamless
                communication
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: <MessageCircle className="h-8 w-8 text-primary" />,
                  title: "Instant Messaging",
                  description:
                    "Send and receive messages instantly with our real-time messaging system.",
                },
                {
                  icon: <Shield className="h-8 w-8 text-primary" />,
                  title: "Secure & Private",
                  description:
                    "Your conversations are protected with end-to-end encryption.",
                },
                {
                  icon: <Zap className="h-8 w-8 text-primary" />,
                  title: "Lightning Fast",
                  description:
                    "Experience the fastest messaging platform with minimal latency.",
                },
                {
                  icon: <Users className="h-8 w-8 text-primary" />,
                  title: "Connect with Friends",
                  description:
                    "Find your friends easily and start chatting right away.",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="group relative rounded-xl border p-6 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col gap-4">
                    <div className="bg-primary/10 rounded-full w-14 h-14 flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                    <div className="mt-2">
                      <Link
                        to="#"
                        className="text-primary inline-flex items-center font-medium"
                      >
                        Learn More
                        <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="bg-muted py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Loved by Users Worldwide
              </h2>
              <p className="mt-4 text-muted-foreground md:text-xl/relaxed">
                Don't just take our word for it. Here's what our users have to
                say.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                {
                  quote:
                    "ChatConnect has transformed how I stay in touch with friends. The interface is beautiful and intuitive!",
                  author: "Sarah Johnson",
                  role: "Designer",
                },
                {
                  quote:
                    "The best messaging platform I've used. Fast, reliable, and with all the features I need.",
                  author: "Michael Chen",
                  role: "Software Engineer",
                },
                {
                  quote:
                    "I love how easy it is to find and connect with friends. The UI is clean and modern.",
                  author: "Emma Rodriguez",
                  role: "Marketing Professional",
                },
              ].map((testimonial, index) => (
                <div
                  key={index}
                  className="rounded-xl bg-background p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="text-primary"
                        >
                          <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7-6-4.6h7.6L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-muted-foreground">
                      "{testimonial.quote}"
                    </p>
                    <div className="mt-4">
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="rounded-xl bg-primary p-8 md:p-12 text-primary-foreground">
              <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                    Ready to Start Chatting?
                  </h2>
                  <p className="mt-4 md:text-xl/relaxed">
                    Join thousands of users who are already connecting through
                    ChatConnect. Sign up today and experience the difference.
                  </p>
                  <div className="mt-8">
                    <Link to="/signup">
                      <Button size="lg" variant="secondary" className="group">
                        Create Account
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="flex justify-center lg:justify-end">
                  <img
                    src="https://images.pexels.com/photos/5082579/pexels-photo-5082579.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                    alt="People chatting"
                    className="rounded-lg max-w-full h-auto"
                    width={400}
                    height={300}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
