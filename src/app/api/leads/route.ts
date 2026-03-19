import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "leads.json");

function readLeads(): Lead[] {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, "[]", "utf-8");
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function writeLeads(leads: Lead[]) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(leads, null, 2), "utf-8");
}

export interface Lead {
    id: string;
    created_at: string;

    // Contact (filled in step 2 via PATCH)
    name?: string;
    email?: string;
    phone?: string;

    // Qualification result from AI JSON
    qualified: boolean;
    program?: string;
    fit?: string;
    urgency?: string;
    ready?: string;
    why?: string;
    disqualify_reason?: string;

    // Full conversation snapshot
    conversation: { role: string; content: string }[];
    session_id?: string;
}

// POST /api/leads — save qualification result + conversation
export async function POST(req: Request) {
    const body = await req.json();

    const lead: Lead = {
        id: randomUUID(),
        created_at: new Date().toISOString(),
        qualified: body.qualified ?? false,
        program: body.program,
        fit: body.fit,
        urgency: body.urgency,
        ready: body.ready,
        why: body.why,
        disqualify_reason: body.disqualify_reason,
        conversation: body.conversation ?? [],
        session_id: body.session_id,
    };

    const leads = readLeads();
    leads.push(lead);
    writeLeads(leads);

    return Response.json({ id: lead.id }, { status: 201 });
}

// GET /api/leads — list all leads (useful for a simple admin view later)
export async function GET() {
    const leads = readLeads();
    // Sort newest first
    leads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return Response.json(leads);
}
