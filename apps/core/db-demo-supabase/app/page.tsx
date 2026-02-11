'use client';

import { useState } from "react";
import { Button } from "@402systems/core-ui/components/ui/button";
import { Input } from "@402systems/core-ui/components/ui/input";
import { Label } from "@402systems/core-ui/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@402systems/core-ui/components/ui/card";
import { createClient } from "@/utils/supabase/client";

export default function Page() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('test')
        .insert([{ name: name.trim() }]);

      if (error) {
        console.error("Supabase error:", error);
        alert(`Error: ${error.message}`);
      } else {
        alert(`Successfully added "${name}" to the test table!`);
        setName("");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Supabase DB Demo</CardTitle>
          <CardDescription>
            Enter your name to save it to the "test" table.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2 flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit to DB"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
