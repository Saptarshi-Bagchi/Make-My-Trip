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
            ? "border-[#24413D] hover:border-[#7FD1C4]"
            : "border-gray-300 hover:border-blue-500"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2">
          {icon}
          <div className="flex-1 min-w-0 pr-3">
            <div className={`text-sm truncate ${isDark ? "text-[#7C948F]" : "text-gray-500"}`}>
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
                isDark ? "text-[#EAF2F0] placeholder:text-[#7C948F]" : "text-[#1F3330] placeholder:text-gray-400"
              }`}
              placeholder={placeholder}
            />
            <div className={`text-xs truncate ${isDark ? "text-[#62807C]" : "text-gray-400"}`}>
              {subtitle}
            </div>
          </div>
        </div>
      </div>
      {isOpen && (
        <div
          className={`absolute z-10 w-full mt-1 border rounded-md shadow-lg ${
            isDark ? "bg-[#1A302C] border-[#24413D]" : "bg-white border-gray-300"
          }`}
        >
          <ScrollArea className="h-64">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option: any) => (
                <Button
                  key={option.value}
                  className={`w-full justify-start font-normal ${
                    isDark
                      ? "text-[#EAF2F0] hover:bg-[#24413D] hover:text-[#EAF2F0] focus:bg-[#24413D] focus:text-[#EAF2F0]"
                      : "text-[#1F3330] hover:bg-gray-100 hover:text-[#1F3330]"
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
              <div className={`px-4 py-3 text-sm ${isDark ? "text-[#7C948F]" : "text-gray-400"}`}>
                No matches found
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}