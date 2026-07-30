import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"


export function SearchSelect({ options, placeholder, value, onChange, icon, subtitle, isDark }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredOptions = options.filter((option:any) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={wrapperRef} className="relative">
      <div
        className={`border rounded-lg px-4 py-3 cursor-pointer transition-colors ${
          isDark
            ? "border-[#2A3854] bg-[#1A2234]/70 hover:border-indigo-500"
            : "border-slate-200 bg-white hover:border-indigo-500"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2">
          {icon}
          <div className="flex-1 min-w-0 pr-3">
            <div className={`text-sm truncate ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {placeholder}
            </div>
            <Input
              type="text"
              value={value || searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                onChange('');
              }}
              style={{
                background: "transparent",
                border: "none",
                boxShadow: "none",
                height: "auto",
                padding: 0,
                borderRadius: 0,
              }}
              className={`font-semibold w-full focus-visible:ring-0 focus-visible:ring-offset-0 ${
                isDark ? "text-slate-100 placeholder:text-slate-400" : "text-slate-900 placeholder:text-slate-400"
              }`}
              placeholder={placeholder}
            />
            <div className={`text-xs truncate ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              {subtitle}
            </div>
          </div>
        </div>
      </div>
      {isOpen && (
        <div
          className={`absolute z-10 w-full mt-1 border rounded-md shadow-lg ${
            isDark ? "bg-[#121826] border-[#2A3854]" : "bg-white border-slate-200"
          }`}
        >
          <ScrollArea className="h-64">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option: any) => (
                <Button
                  key={option.value}
                  className={`w-full justify-start font-normal ${
                    isDark
                      ? "text-slate-100 hover:bg-[#1A2234] hover:text-white focus:bg-[#1A2234] focus:text-white"
                      : "text-slate-900 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                  variant="ghost"
                  onClick={() => {
                    onChange(option.value);
                    setSearchTerm('');
                    setIsOpen(false);
                  }}
                >
                  {option.label}
                </Button>
              ))
            ) : (
              <div className={`px-4 py-3 text-sm ${isDark ? "text-slate-400" : "text-slate-400"}`}>
                No matches found
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
