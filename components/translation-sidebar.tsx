"use client";

import { useState } from "react";
import { Check, Search, Globe } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TARGET_LANGUAGES } from "@/constants/languages";
import { cn } from "@/lib/utils";

interface TranslationSidebarProps {
  children: React.ReactNode;
  onLanguageSelect: (lang: string) => void;
  selectedLanguage: string;
}

export function TranslationSidebar({
  children,
  onLanguageSelect,
  selectedLanguage,
}: TranslationSidebarProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLanguages = TARGET_LANGUAGES.filter((lang) =>
    lang.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (value: string) => {
    onLanguageSelect(value);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[400px] flex flex-col p-0 gap-0 border-l border-zinc-800 bg-[#1c1f2e] text-white">
        <SheetHeader className="p-6 border-b border-white/10 text-left space-y-1">
          <SheetTitle className="text-xl font-semibold flex items-center gap-2 text-white">
            <Globe className="h-5 w-5 text-[#0E78F9]" />
            Translation
          </SheetTitle>
          <SheetDescription className="text-zinc-400 text-sm">
            Select a target language for real-time translation.
          </SheetDescription>
        </SheetHeader>

        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search languages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-[#0E78F9]"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredLanguages.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">
                No languages found matching "{searchQuery}"
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-1">
                {filteredLanguages.map((lang) => {
                  const isSelected = selectedLanguage === lang.value;
                  return (
                    <Button
                      key={lang.value}
                      variant="ghost"
                      onClick={() => handleSelect(lang.value)}
                      className={cn(
                        "w-full justify-between h-auto py-3 px-4 font-normal hover:bg-white/5 hover:text-white transition-colors",
                        isSelected && "bg-[#0E78F9]/10 text-[#0E78F9] hover:bg-[#0E78F9]/20 hover:text-[#0E78F9]"
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-base">{lang.label}</span>
                        {lang.value.includes("-") && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-zinc-400">
                            {lang.value.split("-")[1]}
                          </span>
                        )}
                      </span>
                      {isSelected && <Check className="h-4 w-4 text-[#0E78F9]" />}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
