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
import { gethotel } from "@/api";
import Loader from "../Loader";

const HotelList = ({ onSelect, isDark }: { onSelect: (hotel: any) => void; isDark: boolean }) => {
  const [hotel, sethotel] = useState<any[]>([]);
  const [loading, setloading] = useState(true);
  useEffect(() => {
    const fetchhotel = async () => {
      try {
        const data = await gethotel();
        sethotel(data);
      } catch (error) {
        console.error(error);
      } finally {
        setloading(false);
      }
    };
    fetchhotel();
  }, []);
  
  if (loading) {
    return <Loader />;
  }
  return (
    <div>
      <h3 className={`mb-3 text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Hotel List</h3>
      <Table>
        <TableHeader className={isDark ? "bg-[#1A2234]" : "bg-slate-50"}>
          <TableRow className={isDark ? "border-[#2A3854] hover:bg-[#1A2234]" : "border-slate-200 hover:bg-slate-50"}>
            <TableHead className={isDark ? "text-slate-400" : "text-slate-500"}>Hotel Name</TableHead>
            <TableHead className={isDark ? "text-slate-400" : "text-slate-500"}>Location</TableHead>
            <TableHead className={isDark ? "text-slate-400" : "text-slate-500"}>Price/Night</TableHead>
            <TableHead className={isDark ? "text-slate-400" : "text-slate-500"}>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hotel.length > 0 ? (
            hotel.map((hotel: any) => (
              <TableRow key={hotel._id} className={isDark ? "border-[#222F43] hover:bg-[#1A2234]/70" : "border-slate-100 hover:bg-indigo-50/50"}>
                <TableCell>{hotel.hotelName}</TableCell>
                <TableCell>{hotel.location}</TableCell>
                <TableCell>${hotel.pricePerNight}</TableCell>
                <TableCell>
                  <Button className="h-8 bg-indigo-600 px-3 text-xs text-white hover:bg-indigo-700" onClick={() => onSelect(hotel)}>Edit</Button>
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
export default HotelList;
