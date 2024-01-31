import Image from "next/image";
import { withTheme } from "@mui/styles";

function Configure() {
  return (
    <div className="w-100 h-100 relative flex min-h-screen flex-col items-center justify-center bg-none">
      <div className="pointer-events-none absolute bottom-4 left-4 h-[512px] w-[512px] bg-[#27272a] opacity-50 blur-[256px]" />
      <div className="opactiry-50 pointer-events-none absolute right-4 top-4 h-[512px] w-[512px] bg-[#27272a] blur-[256px]" />
      {/* opacity-50 blur-[256px] */}
    </div>
  );
}

export default withTheme(Configure);
