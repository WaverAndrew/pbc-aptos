import { NextResponse } from 'next/server';
import { retrieveRelevantQuestions } from '@/lib/ai/vectorstore';

export async function POST(request: Request) {
    try {
        const { query } = await request.json();

        if (!query) {
            return NextResponse.json(
                { error: 'Query is required' },
                { status: 400 }
            );
        }

        const questions = await retrieveRelevantQuestions(query);
        return NextResponse.json(questions);
    } catch (error) {
        console.error('Error in relevant questions API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 