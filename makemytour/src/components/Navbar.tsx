import React from "react";
import SignupDialog from "./SignupDialog";
import { Plane } from "lucide-react";
import { useSelector } from "react-redux";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Navbar = () => {
    const user = useSelector((state: any) => state.user.user);
    return (
        <header className="bg-black/20 backdrop-blur-md py-4 sticky top-0 z-50">
            <div className="container mx-auto px-4 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-white">
                    <Plane className="w-8 h-8 text-red-500" />
                    <span className="text-2xl font-bold">MakeMyTour</span>
                </div>
                <div className="flex items-center space-x-4">
                    {user ? (<>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button>
                                    <Avatar>
                                        <AvatarFallback>{user?.name.chatAt(0)}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>
                                    <div>
                                        <p>{user.firstName}</p>
                                        <p>{user.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator/>
                                <DropdownMenuItem>
                                    <LogOut/>
                                    <span>Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <LogOut/>
                                    <span>Logout</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>) : <SignupDialog />}
                </div>
            </div>
        </header>
    );
}

export default Navbar;