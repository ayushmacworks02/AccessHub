import { ArrowLeft, SearchX } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { appConfig } from "@/config/app.config";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[calc(100svh-8rem)] items-center justify-center p-4">
      <Card className="w-full max-w-lg border-border/80 shadow-sm">
        <CardContent className="p-6 text-center sm:p-8">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted">
            <SearchX className="size-6 text-muted-foreground" />
          </div>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            Page not found
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            The page you are looking for does not exist, may have been moved, or
            you may have used an incorrect URL.
          </p>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="size-4" />
              Go back
            </Button>

            <Button
              type="button"
              onClick={() => navigate(appConfig.routes.dashboard)}
            >
              Go to dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}