import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { 
  HelpCircle, MessageCircle, FileText, Video, Clock, Shield, Sparkles,
  Mail, Phone, Download, ExternalLink 
} from 'lucide-react';
import { toast } from 'sonner';

const FAQ_ITEMS = [
  {
    question: 'How do I start a meeting?',
    answer: 'Click "New Meeting" from dashboard or "Quick Meeting" from sidebar. Share the room code with participants.'
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes, all meetings use end-to-end encryption. AI summaries are processed locally first, then securely on our servers.'
  },
  {
    question: 'What happens to recordings?',
    answer: 'Recordings are automatically deleted after 30 days unless you choose to export them. AI transcripts are available forever.'
  },
  {
    question: 'Can I use my own AI model?',
    answer: 'Pro users can connect custom models via API keys in Settings > Integrations.'
  },
  {
    question: 'Do you support mobile?',
    answer: 'Full mobile support via PWA. Install from browser menu for native-like experience.'
  },
];

export default function Help() {
  const handleEmailSupport = () => {
    window.location.href = 'mailto:support@intellmeet.com';
    toast.success('Opening email client...');
  };

  const handleLiveChat = () => {
    toast.info('Live chat opens (integration stub)');
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-2xl px-6 py-3 mb-4">
          <Sparkles className="h-5 w-5 text-blue-500" />
          <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Find answers or get help fast
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all col-span-full md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-6 w-6" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>Common questions and quick answers</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {FAQ_ITEMS.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-0 border-b border-border/50">
                  <AccordionTrigger className="px-0 pb-2 hover:no-underline">
                    <div className="text-left">
                      <h3 className="font-semibold text-foreground">{item.question}</h3>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <div className="space-y-4 md:col-span-1">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <MessageCircle className="h-5 w-5" />
                Need more help?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleLiveChat} className="w-full h-14 rounded-xl justify-start gap-2 font-semibold shadow-lg hover:shadow-xl">
                <MessageCircle className="h-5 w-5" />
                Live Chat (2 min avg response)
              </Button>
              <Button onClick={handleEmailSupport} variant="outline" className="w-full h-14 rounded-xl justify-start gap-2 shadow-lg hover:shadow-xl">
                <Mail className="h-5 w-5" />
                Email Support
              </Button>
              <div className="pt-4">
                <p className="text-xs text-muted-foreground mb-3">📞 Phone: +1 (555) 123-4567</p>
                <p className="text-xs text-muted-foreground mb-4">🕒 Mon-Fri 9AM-6PM EST</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="ghost" className="w-full justify-start h-12 rounded-xl hover:bg-blue-50 text-left gap-2 group hover:text-blue-900">
                <Video className="h-4 w-4 group-hover:text-blue-600" />
                <span>Getting Started Guide</span>
                <ExternalLink className="h-3 w-3 ml-auto opacity-60" />
              </Button>
              <Button variant="ghost" className="w-full justify-start h-12 rounded-xl hover:bg-blue-50 text-left gap-2 group hover:text-blue-900">
                <Clock className="h-4 w-4 group-hover:text-blue-600" />
                <span>Recording & Privacy Policy</span>
                <ExternalLink className="h-3 w-3 ml-auto opacity-60" />
              </Button>
              <Button variant="ghost" className="w-full justify-start h-12 rounded-xl hover:bg-blue-50 text-left gap-2 group hover:text-blue-900">
                <Shield className="h-4 w-4 group-hover:text-blue-600" />
                <span>Security Best Practices</span>
                <ExternalLink className="h-3 w-3 ml-auto opacity-60" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4 pt-4">
          <div className="text-center p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Sparkles className="h-6 w-6 text-emerald-500" />
            </div>
            <h3 className="font-semibold text-lg mb-1">🟢 All Systems Go</h3>
            <p className="text-sm text-muted-foreground">No incidents reported</p>
          </div>
          <div className="text-center p-6 bg-blue-500/10 border border-blue-500/30 rounded-2xl">
            <Clock className="h-12 w-12 mx-auto mb-3 text-blue-500/70" />
            <h3 className="font-semibold text-lg mb-1">Uptime</h3>
            <p className="text-2xl font-bold text-blue-600">99.99%</p>
            <p className="text-xs text-blue-600/80 mt-1">Last 30 days</p>
          </div>
          <div className="md:col-span-1 col-span-full text-center p-6 border-2 border-orange-500/30 rounded-2xl bg-orange-500/5">
            <div className="w-12 h-12 border-2 border-dashed border-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3 text-orange-500">
              ⚠️
            </div>
            <h3 className="font-semibold text-lg mb-1">Known Issue</h3>
            <p className="text-sm text-muted-foreground mb-2">iOS Safari recording</p>
            <Button variant="outline" size="sm" className="rounded-lg">
              Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
