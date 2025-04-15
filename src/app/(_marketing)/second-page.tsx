import GlassButton from "./glass-button";

const Second = () => {
  return ( 
    <div className="w-full h-screen bg-gradient-to-tr flex items-center justify-center from-red-200 to-blue-200">
    <div className=" text-center">
      <h1 className="text-2xl font-medium mb-4">Future content will be here.....</h1>
      <div className="flex flex-row gap-4 ">
        <GlassButton href="/userregistration" text="Registration"/>
        <GlassButton href="/admin" text="Admin"/>
      </div>
    </div>
  </div>
   );
}
 
export default Second;