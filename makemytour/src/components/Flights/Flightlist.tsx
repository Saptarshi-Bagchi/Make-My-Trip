import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { getflight } from "@/api";
import Loader from "../Loader";
const FlightList = ({ onSelect, isDark }: { onSelect: (flight: any) => void; isDark: boolean }) => {
    const [flight, setflight] = useState<any[]>([]);
    const [loading, setloading] = useState(true);
    useEffect(() => {
        const fetchflight = async () => {
            try {
                const data = await getflight();
                setflight(data);
            } catch (error) {
                console.error(error);
            } finally {
                setloading(false);
            }
        };
        fetchflight();
    }, []);

    if (loading) {
        return <Loader />;
    }
    return (
        <div>
            <h3 className={`mb-3 text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Flight List</h3>
            <Table>
                <TableHeader className={isDark ? "bg-[#1A2234]" : "bg-slate-50"}>
                    <TableRow className={isDark ? "border-[#2A3854] hover:bg-[#1A2234]" : "border-slate-200 hover:bg-slate-50"}>
                        <TableHead className={isDark ? "text-slate-400" : "text-slate-500"}>Flight Name</TableHead>
                        <TableHead className={isDark ? "text-slate-400" : "text-slate-500"}>From</TableHead>
                        <TableHead className={isDark ? "text-slate-400" : "text-slate-500"}>To</TableHead>
                        <TableHead className={isDark ? "text-slate-400" : "text-slate-500"}>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {flight.length > 0 ? (
                        flight?.map((flight: any) => (
                            <TableRow key={flight._id} className={isDark ? "border-[#222F43] hover:bg-[#1A2234]/70" : "border-slate-100 hover:bg-indigo-50/50"}>
                                <TableCell>{flight.flightName}</TableCell>
                                <TableCell>{flight.from}</TableCell>
                                <TableCell>{flight.to}</TableCell>
                                <TableCell>
                                    <Button className="h-8 bg-indigo-600 px-3 text-xs text-white hover:bg-indigo-700" onClick={() => onSelect(flight)}>Edit</Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell>No data</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};
export default FlightList;
