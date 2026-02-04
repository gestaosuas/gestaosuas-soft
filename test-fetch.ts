
async function testFetch() {
    try {
        console.log("Testing fetch to google.com...");
        const res = await fetch("https://www.google.com");
        console.log("Google response status:", res.status);
        
        console.log("Testing fetch to Supabase health...");
        const res2 = await fetch("https://xvyaaavcbxskmunmhwcg.supabase.co/auth/v1/health");
        console.log("Supabase health status:", res2.status);
    } catch (e: any) {
        console.error("Fetch failed with error:", e.message);
        if (e.cause) console.error("Cause:", e.cause);
    }
}

testFetch();
