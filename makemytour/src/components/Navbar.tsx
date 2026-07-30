import React from "react";
import SignupDialog from "./SignupDialog";
import { LogOut, Moon, Plane, Sun, User, ShieldAlert } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { clearUser } from "@/store";
import { useRouter } from "next/navigation";
import { useTheme } from "./ThemeContext";

const Navbar = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user.user);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const logout = () => {
    dispatch(clearUser());
  };

  const isDark = theme === "dark";

  const userRole = user?.role || user?.user?.role || "";
  const isAdmin = userRole.toString().trim().toUpperCase() === "ADMIN";

  const systemFontStack = {
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  };

  return (
    <header
      style={systemFontStack}
      className={`sticky top-0 z-50 border-b py-4 backdrop-blur-md transition-colors ${
        isDark
          ? "bg-[#1A302C]/90 border-[#24413D]"
          : "bg-white/90 border-[#E3ECE9]"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between" style={systemFontStack}>
        <div
          className="flex items-center space-x-2.5 cursor-pointer select-none group"
          onClick={() => router.push("/")}
        >
          <Plane className={`w-7 h-7 transition-transform duration-300 group-hover:scale-105 ${isDark ? "text-[#7FD1C4]" : "text-[#3E6E6A]"}`} />
          <span
            className={`text-2xl font-bold tracking-tight ${isDark ? "text-[#EAF2F0]" : "text-[#1F3330]"}`}
            style={{ fontFamily: "Georgia, 'Times New Roman', Times, serif" }}
          >
            MakeMyTour
          </span>
        </div>

        <div className="flex items-center space-x-3" style={systemFontStack}>
          {/* Leftmost Slot: Admin Button */}
          {user && isAdmin && (
            <Button
              variant="default"
              size="sm"
              style={systemFontStack}
              className={`rounded-full px-4 text-xs font-semibold tracking-wider transition-all flex items-center gap-1.5 border ${
                isDark 
                  ? "bg-[#162624] text-[#7FD1C4] border-[#24413D] hover:bg-[#24413D]" 
                  : "bg-[#EBF3F1] text-[#3E6E6A] border-[#D1E2DE] hover:bg-[#DCEAE7]"
              }`}
              onClick={() => router.push("/admin")}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Admin
            </Button>
          )}

          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            style={systemFontStack}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
              isDark
                ? "border-[#24413D] bg-[#162624] text-[#EAF2F0] hover:bg-[#24413D]"
                : "border-[#E3ECE9] bg-[#F1F6F5] text-[#3E6E6A] hover:bg-[#E3ECE9]"
            }`}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Profile Dropdown or Sign Up Dialog */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  style={systemFontStack}
                  className="relative h-9 w-9 rounded-full focus-visible:ring-2 focus-visible:ring-offset-2"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback 
                      style={systemFontStack}
                      className="bg-[#3E6E6A] text-white font-medium text-sm"
                    >
                      {(user?.firstName || user?.user?.firstName || "U").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                style={systemFontStack}
                className={`w-60 border shadow-xl rounded-xl p-1.5 ${
                  isDark 
                    ? "bg-[#1A302C] border-[#24413D] text-[#EAF2F0]" 
                    : "bg-white border-[#E3ECE9] text-[#1F3330]"
                }`}
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal px-3 py-2.5">
                  <div className="flex flex-col space-y-1" style={systemFontStack}>
                    <p className="text-sm font-semibold tracking-tight leading-snug">
                      {user?.firstName || user?.user?.firstName || "User"} {user?.lastName || user?.user?.lastName || ""}
                    </p>
                    <p className={`text-xs leading-normal truncate ${isDark ? "text-[#7FA39D]" : "text-muted-foreground"}`}>
                      {user?.email || user?.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className={`my-1 ${isDark ? "bg-[#24413D]" : "bg-[#E3ECE9]"}`} />
                <DropdownMenuItem 
                  style={systemFontStack}
                  className={`cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:bg-[#3E6E6A]/10 ${isDark ? "focus:text-[#7FD1C4]" : ""}`} 
                  onClick={() => router.push("/profile")}
                >
                  <User className="mr-2.5 h-4 w-4 opacity-70" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className={`my-1 ${isDark ? "bg-[#24413D]" : "bg-[#E3ECE9]"}`} />
                <DropdownMenuItem 
                  style={systemFontStack}
                  className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-rose-500 focus:bg-rose-500/10 focus:text-rose-500 transition-colors" 
                  onClick={() => logout()}
                >
                  <LogOut className="mr-2.5 h-4 w-4 opacity-70" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <SignupDialog
              trigger={
                <Button
                  variant="default"
                  style={systemFontStack}
                  className="bg-[#3E6E6A] text-white hover:bg-[#2C504D] rounded-full px-5 text-sm font-medium shadow-sm transition-all"
                >
                  Get Started
                </Button>
              }
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;