import fs from "fs";
import path from "path";
import type { Lead } from "../route";

const DATA_FILE = path.join(process.cwd(), "data", "leads.json");

function readLeads(): Lead[] {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function writeLeads(leads: Lead[]) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(leads, null, 2), "utf-8");
}

// PATCH /api/leads/:id — attach contact info after form submit
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await req.json();

    const leads = readLeads();
    const index = leads.findIndex((l) => l.id === id);

    if (index === -1) {
        return Response.json({ error: "Lead not found" }, { status: 404 });
    }

    leads[index] = {
        ...leads[index],
        name: body.name ?? leads[index].name,
        email: body.email ?? leads[index].email,
        phone: body.phone ?? leads[index].phone,
    };

    writeLeads(leads);

    return Response.json(leads[index]);
}
