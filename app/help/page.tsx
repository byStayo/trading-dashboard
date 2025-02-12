import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function HelpPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Help Center</h1>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Find answers to common questions about using the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I create a new watchlist?</AccordionTrigger>
              <AccordionContent>
                To create a new watchlist, navigate to the Watchlist page and click on the "Create New Watchlist"
                button. Enter a name for your watchlist and start adding stocks by their ticker symbols.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How can I customize my dashboard?</AccordionTrigger>
              <AccordionContent>
                You can customize your dashboard by clicking on the settings icon in the top right corner of the
                dashboard. From there, you can add, remove, or rearrange widgets to suit your preferences.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>How do I access the Business Major program?</AccordionTrigger>
              <AccordionContent>
                To access the Business Major program, click on the "Business Major" link in the sidebar. From there, you
                can view the program overview, course catalog, and track your progress through the asynchronous learning
                modules.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>How can I use the Financial Advisor tools?</AccordionTrigger>
              <AccordionContent>
                The Financial Advisor tools can be accessed by clicking on the "Financial Advisor" link in the sidebar.
                This section includes features like client management, pitch builder, and visualization tools to help
                you create compelling presentations for your clients.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
          <CardDescription>Need additional help? Reach out to our support team</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Email: support@example.com</p>
          <p>Phone: +1 (555) 123-4567</p>
          <p>Support Hours: Monday - Friday, 9 AM - 5 PM EST</p>
        </CardContent>
      </Card>
    </div>
  )
}

