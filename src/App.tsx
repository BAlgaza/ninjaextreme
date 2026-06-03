import { useEffect } from "react";

const REDIRECT_BASE = "https://web.kotagames.web.id";

const App = () => {
  useEffect(() => {
    const { pathname, search, hash } = window.location;
    window.location.replace(`${REDIRECT_BASE}${pathname}${search}${hash}`);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center px-6">
        <p className="text-sm text-muted-foreground">
          Mengarahkan ke{" "}
          <a href={REDIRECT_BASE} className="text-primary underline">
            kotagames.web.id
          </a>
          ...
        </p>
      </div>
    </div>
  );
};

export default App;
