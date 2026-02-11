const NotFound = () => (
  <div className="flex flex-col gap-2 items-center justify-center min-h-screen bg-background">
    <h1 className="text-8xl font-medium text-foreground">404</h1>
    <p className="text-2xl text-foreground">Page not found</p>
    <a
      href="/dashboard"
      className="px-8 py-2 bg-primary text-white rounded hover:bg-primary/70 transition-colors"
    >
      Go to Dashboard
    </a>
  </div>
);

export default NotFound;