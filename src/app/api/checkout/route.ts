import { NextRequest, NextResponse } from 'next/server';
import { POST as preferencePOST } from './preference/route';

export async function POST(req: NextRequest) {
  return preferencePOST(req);
}
