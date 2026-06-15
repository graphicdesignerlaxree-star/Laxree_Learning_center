'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { HelpCircle, Search } from 'lucide-react'

interface QuestionData {
  id: string
  question: string
  optionA: string
  optionB: string
  optionC: string | null
  optionD: string | null
  correctAnswer: string
  category: string | null
  difficulty: string | null
  moduleType: string | null
}

const INITIAL_QUESTIONS: QuestionData[] = [
  { id: '1', question: "What is LAXREE's primary business segment?", optionA: 'Hotel amenities and supplies', optionB: 'Restaurant equipment', optionC: 'Office supplies', optionD: 'Automotive parts', correctAnswer: 'A', category: 'Product Knowledge', difficulty: 'easy', moduleType: 'PRODUCT_ACADEMY' },
  { id: '2', question: 'Which product category includes in-room safes?', optionA: 'Mini Bar', optionB: 'Safe Box', optionC: 'Amenities', optionD: 'Electronics', correctAnswer: 'B', category: 'Product Knowledge', difficulty: 'easy', moduleType: 'PRODUCT_ACADEMY' },
  { id: '3', question: 'What is the first step in the sales discovery process?', optionA: 'Pitch the product', optionB: 'Understand customer needs', optionC: 'Negotiate pricing', optionD: 'Close the deal', correctAnswer: 'B', category: 'Sales Skills', difficulty: 'medium', moduleType: 'SALES_ACADEMY' },
  { id: '4', question: 'What is the recommended approach for handling hotel objections?', optionA: 'Discount immediately', optionB: 'Listen, acknowledge, and address', optionC: 'Ignore and continue', optionD: 'End the conversation', correctAnswer: 'B', category: 'Sales Skills', difficulty: 'medium', moduleType: 'SALES_ACADEMY' },
  { id: '5', question: 'What certification is required for field sales readiness?', optionA: 'None', optionB: 'Product Knowledge Certification', optionC: 'Field Sales Readiness Certification', optionD: 'Both B and C', correctAnswer: 'D', category: 'Certification', difficulty: 'hard', moduleType: 'FIELD_SALES' },
  { id: '6', question: "What is the primary benefit of LAXREE mini bars?", optionA: 'Low cost', optionB: 'Energy efficiency and design', optionC: 'Weight', optionD: 'Color options', correctAnswer: 'B', category: 'Product Knowledge', difficulty: 'medium', moduleType: 'PRODUCT_ACADEMY' },
  { id: '7', question: 'How should you handle a competitive bid situation?', optionA: 'Lower your price', optionB: 'Highlight unique value proposition', optionC: 'Walk away', optionD: 'Copy competitor features', correctAnswer: 'B', category: 'Sales Skills', difficulty: 'hard', moduleType: 'SALES_ACADEMY' },
  { id: '8', question: "What is the hospitality industry term for guest satisfaction?", optionA: 'Guest Delight', optionB: 'Net Promoter Score', optionC: 'Guest Experience Index', optionD: 'All of the above', correctAnswer: 'D', category: 'Hospitality', difficulty: 'hard', moduleType: 'HOSPITALITY' },
  { id: '9', question: "What is LAXREE's competitive advantage in the amenities market?", optionA: 'Price only', optionB: 'Quality, customization, and service', optionC: 'Location', optionD: 'Size', correctAnswer: 'B', category: 'Competitive Intelligence', difficulty: 'medium', moduleType: 'COMPETITIVE_INTELLIGENCE' },
  { id: '10', question: 'What is the key metric for inbound sales success?', optionA: 'Call volume', optionB: 'Conversion rate', optionC: 'Talk time', optionD: 'Number of emails', correctAnswer: 'B', category: 'Inbound Sales', difficulty: 'easy', moduleType: 'INBOUND_SALES' },
]

export function QuestionBanksView() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const questions = INITIAL_QUESTIONS

  const filtered = questions.filter(q => {
    if (!search) return true
    const s = search.toLowerCase()
    return q.question.toLowerCase().includes(s) || (q.category || '').toLowerCase().includes(s)
  }).filter(q => filter === 'all' || q.difficulty === filter)

  const DIFFICULTY_COLORS: Record<string, string> = {
    easy: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    hard: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-emerald-600" />
          </div>
          Question Banks
        </h1>
        <p className="text-gray-500 mt-1 ml-13">Manage assessment questions and categories</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Search questions..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="flex gap-2">
              {['all', 'easy', 'medium', 'hard'].map(f => (
                <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm"
                  className={filter === f ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                  onClick={() => setFilter(f)}>
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Questions', value: questions.length, color: 'text-emerald-600' },
          { label: 'Easy', value: questions.filter(q => q.difficulty === 'easy').length, color: 'text-emerald-600' },
          { label: 'Medium', value: questions.filter(q => q.difficulty === 'medium').length, color: 'text-amber-600' },
          { label: 'Hard', value: questions.filter(q => q.difficulty === 'hard').length, color: 'text-red-600' },
        ].map(s => (
          <Card key={s.label}><CardContent className="p-3 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </CardContent></Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead className="hidden lg:table-cell">Answer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((q, i) => (
                  <TableRow key={q.id} className="hover:bg-gray-50/50">
                    <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="text-sm max-w-[300px]">{q.question}</TableCell>
                    <TableCell className="hidden md:table-cell"><Badge variant="secondary" className="text-xs">{q.category}</Badge></TableCell>
                    <TableCell><Badge className={DIFFICULTY_COLORS[q.difficulty || 'medium'] || ''} variant="secondary">{q.difficulty}</Badge></TableCell>
                    <TableCell className="hidden lg:table-cell"><span className="font-medium text-emerald-600">{q.correctAnswer}</span></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
