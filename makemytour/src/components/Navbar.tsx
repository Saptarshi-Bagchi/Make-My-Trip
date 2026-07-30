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
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  };

  return (
    <header
      style={systemFontStack}
      className={`sticky top-0 z-50 border-b py-3 sm:py-4 backdrop-blur-md transition-colors w-full overflow-hidden ${
        isDark
          ? "bg-[#0A0D14]/90 border-[#222F43]"
          : "bg-white/80 border-slate-200/80 shadow-slate-200/50"
      }`}
    >
      <div
        className="container mx-auto px-3 sm:px-6 flex items-center justify-between max-w-full"
        style={systemFontStack}
      >
        {/* Brand Logo */}
        <div
          className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer select-none group shrink-0"
          onClick={() => router.push("/")}
        >
          <Plane
            className={`w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-300 group-hover:scale-105 ${
              isDark ? "text-indigo-400" : "text-indigo-600"
            }`}
          />
          <span
            className={`text-lg sm:text-2xl font-bold tracking-tight truncate ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            MakeMyTour
          </span>
        </div>

        {/* Action Controls */}
        <div
          className="flex items-center gap-1.5 sm:gap-3 shrink-0"
          style={systemFontStack}
        >
          {/* Admin Button */}
          {user && isAdmin && (
            <Button
              variant="default"
              size="sm"
              style={systemFontStack}
              className={`rounded-full px-2.5 sm:px-4 text-xs font-semibold tracking-wider transition-all flex items-center gap-1.5 border ${
                isDark
                  ? "bg-[#182030] text-indigo-400 border-[#222F43] hover:bg-[#1F293D]"
                  : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
              }`}
              onClick={() => router.push("/admin")}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </Button>
          )}

          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            style={systemFontStack}
            className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border transition-colors shrink-0 ${
              isDark
                ? "border-[#222F43] bg-[#121826] text-slate-200 hover:bg-[#1A2234]"
                : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Profile Dropdown / Signup */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  style={systemFontStack}
                  className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 shrink-0 p-0"
                >
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                    <AvatarFallback
                      style={systemFontStack}
                      className={
                        isDark
                          ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium text-xs sm:text-sm"
                          : "bg-indigo-600 text-white font-medium text-xs sm:text-sm"
                      }
                    >
                      {(
                        user?.firstName ||
                        user?.user?.firstName ||
                        "U"
                      ).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                style={systemFontStack}
                className={`w-56 sm:w-60 border shadow-xl rounded-xl p-1.5 ${
                  isDark
                    ? "bg-[#121827] border-[#222F43] text-[#F1F5F9]"
                    : "bg-white border-slate-200 text-slate-900"
                }`}
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal px-3 py-2.5">
                  <div className="flex flex-col space-y-1" style={systemFontStack}>
                    <p className="text-sm font-semibold tracking-tight leading-snug">
                      {user?.firstName || user?.user?.firstName || "User"}{" "}
                      {user?.lastName || user?.user?.lastName || ""}
                    </p>
                    <p
                      className={`text-xs leading-normal truncate ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {user?.email || user?.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator
                  className={`my-1 ${
                    isDark ? "bg-[#222F43]" : "bg-slate-200"
                  }`}
                />
                <DropdownMenuItem
                  style={systemFontStack}
                  className={`cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isDark
                      ? "focus:bg-indigo-950/50 focus:text-indigo-300"
                      : "focus:bg-indigo-50 focus:text-indigo-600"
                  }`}
                  onClick={() => router.push("/profile")}
                >
                  <User className="mr-2.5 h-4 w-4 opacity-70" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator
                  className={`my-1 ${
                    isDark ? "bg-[#222F43]" : "bg-slate-200"
                  }`}
                />
                <DropdownMenuItem
                  style={systemFontStack}
                  className={`cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isDark
                      ? "text-rose-400 focus:bg-rose-950/30 focus:text-rose-300"
                      : "text-rose-600 focus:bg-rose-50 focus:text-rose-700"
                  }`}
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
                  className={`rounded-full px-3 sm:px-5 text-xs sm:text-sm font-semibold shadow-sm transition-all shrink-0 ${
                    isDark
                      ? "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
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