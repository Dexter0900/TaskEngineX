import { Link } from "react-router-dom";
import { FiLogIn, FiUserPlus, FiUsers, FiCheckCircle, FiShield, FiMail, FiPhone, FiLinkedin, FiGithub } from "react-icons/fi";
import { useRef, useEffect, useState } from "react";

function useCounterOnVisible(target: React.RefObject<HTMLDivElement>, end: number, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let observer: IntersectionObserver;
    let started = false;
    if (target.current) {
      observer = new window.IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !started) {
            started = true;
            let start = 0;
            const step = Math.ceil(end / (duration / 16));
            const interval = setInterval(() => {
              start += step;
              if (start >= end) {
                setCount(end);
                clearInterval(interval);
              } else {
                setCount(start);
              }
            }, 16);
          }
        },
        { threshold: 0.5 }
      );
      observer.observe(target.current);
    }
    return () => observer && observer.disconnect();
  }, [target, end, duration]);
  return count;
}

export default function LandingPage() {
  const usersRef = useRef<HTMLDivElement>(null);
  const tasksRef = useRef<HTMLDivElement>(null);
  const uptimeRef = useRef<HTMLDivElement>(null);
  const users = useCounterOnVisible(usersRef, 10000);
  const tasks = useCounterOnVisible(tasksRef, 1000000);
  const uptime = useCounterOnVisible(uptimeRef, 100);
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navbar */}
      <nav className="w-full flex items-center justify-between px-6 py-4 border-b border-border bg-card sticky top-0 z-10">
        <a href="#top" className="text-2xl font-bold text-primary tracking-tight hover:opacity-80 transition-opacity">TaskEngineX</a>
        <div className="flex gap-3">
          <Link to="/login" className="flex items-center gap-1 px-4 py-2 rounded font-medium text-white bg-primary hover:bg-primary/80 transition-colors">
            <FiLogIn className="w-5 h-5" /> Login
          </Link>
          <Link to="/signup" className="flex items-center gap-1 px-4 py-2 rounded font-medium text-primary border border-primary bg-transparent hover:bg-primary hover:text-white transition-colors">
            <FiUserPlus className="w-5 h-5" /> Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="top" className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16">
        <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-br from-gray-200 to-white bg-clip-text text-transparent mb-4">
          Effortless Task & Team Management
        </h1>
        <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Supercharge your productivity with a modern, minimal, and powerful workflow engine for teams and individuals.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Link to="/login" className="px-8 py-3 rounded bg-primary text-white font-semibold text-lg shadow hover:bg-primary/90 transition">Get Started</Link>
          <Link to="/signup" className="px-8 py-3 rounded border border-primary text-primary font-semibold text-lg hover:bg-primary hover:text-white transition">Create Free Account</Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full bg-card py-10 border-t border-b border-border flex flex-col md:flex-row justify-center items-center gap-10">
        <div className="flex flex-col items-center" ref={usersRef}>
          <FiUsers className="w-8 h-8 text-primary mb-2" />
          <span className="text-3xl font-bold">{users.toLocaleString()}+</span>
          <span className="text-muted-foreground">Users</span>
        </div>
        <div className="flex flex-col items-center" ref={tasksRef}>
          <FiCheckCircle className="w-8 h-8 text-primary mb-2" />
          <span className="text-3xl font-bold">{tasks.toLocaleString()}+</span>
          <span className="text-muted-foreground">Tasks Managed</span>
        </div>
        <div className="flex flex-col items-center" ref={uptimeRef}>
          <FiShield className="w-8 h-8 text-primary mb-2" />
          <span className="text-3xl font-bold">{uptime}%</span>
          <span className="text-muted-foreground">Uptime</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-background border-t border-border py-6 flex flex-col md:flex-row items-center justify-between px-6 gap-4 mt-auto">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} TaskEngineX</span>
        </div>
        <div className="flex gap-4 text-primary text-xl">
          <a href="mailto:support@taskenginex.com" className="hover:text-foreground" title="Email"><FiMail /></a>
          <a href="tel:+911234567890" className="hover:text-foreground" title="Phone"><FiPhone /></a>
          <a href="https://linkedin.com/in/your-linkedin" target="_blank" rel="noopener noreferrer" className="hover:text-foreground" title="LinkedIn"><FiLinkedin /></a>
          <a href="https://github.com/your-github" target="_blank" rel="noopener noreferrer" className="hover:text-foreground" title="GitHub"><FiGithub /></a>
          <a href="/terms" className="hover:text-foreground" title="Terms"><FiShield /></a>
          <a href="/privacy" className="hover:text-foreground" title="Privacy"><FiCheckCircle /></a>
        </div>
      </footer>
    </div>
  );
}
