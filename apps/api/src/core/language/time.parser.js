export function parseTime(text){

const t=text.toLowerCase();

if(t.includes("kemarin"))

return "yesterday";

if(t.includes("tadi"))

return "today";

if(t.includes("barusan"))

return "today";

if(t.includes("hari ini"))

return "today";

return "now";

}