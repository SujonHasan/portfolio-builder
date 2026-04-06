"use client";

import { useState, FormEvent } from "react";
import { IContact } from "@/types";
import { SectionHeading } from "./section-heading";
import { MotionWrapper } from "@/components/shared/motion-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Send } from "lucide-react";

interface ContactSectionProps {
  contact: IContact | null;
  siteUsername?: string;
}

export function ContactSection({ contact, siteUsername }: ContactSectionProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = siteUsername
        ? `/api/contact/send?site=${encodeURIComponent(siteUsername)}`
        : "/api/contact/send";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast({
          title: "Message sent!",
          description: "Thank you for reaching out. I'll get back to you soon.",
        });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send message. Please try again.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        <SectionHeading title="Get In Touch" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Contact info */}
          <MotionWrapper direction="left">
            <div className="space-y-4">
              {contact?.email && (
                <Card>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="p-2 rounded-md bg-primary/10 text-primary">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <a
                        href={`mailto:${contact.email}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {contact.email}
                      </a>
                    </div>
                  </CardContent>
                </Card>
              )}

              {contact?.phone && (
                <Card>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="p-2 rounded-md bg-primary/10 text-primary">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <a
                        href={`tel:${contact.phone}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {contact.phone}
                      </a>
                    </div>
                  </CardContent>
                </Card>
              )}

              {contact?.address && (
                <Card>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="p-2 rounded-md bg-primary/10 text-primary">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">{contact.address}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {contact?.availability && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                      </span>
                      <span className="font-medium">{contact.availability}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </MotionWrapper>

          {/* Right: Contact form */}
          <MotionWrapper direction="right">
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="What's this about?"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Your message..."
                      rows={5}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </MotionWrapper>
        </div>
      </div>
    </section>
  );
}
