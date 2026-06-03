import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const REDIRECT_BASE = "https://web.kotagames.web.id";

const NotFound = () => {
  const location = useLocation();
  const target = `${REDIRECT_BASE}${location.pathname}${location.search}${location.hash}`;

  useEffect(() => {
    window.location.replace(target);
  }, [target]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center px-6">
        <p className="text-sm text-muted-foreground">
          Mengarahkan ke{" "}
          <a href={target} className="text-primary underline">
            {target}
          </a>
          ...
        </p>
      </div>
    </div>
  );
};

export default NotFound;
