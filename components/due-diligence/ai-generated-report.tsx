import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AIGeneratedReport({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Generated Stock Report</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hedge-fund">
          <TabsList>
            <TabsTrigger value="hedge-fund">Hedge Fund</TabsTrigger>
            <TabsTrigger value="retail">Retail Trader</TabsTrigger>
            <TabsTrigger value="institutional">Institutional Investor</TabsTrigger>
          </TabsList>
          <TabsContent value="hedge-fund">
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: data.hedgeFund }} />
          </TabsContent>
          <TabsContent value="retail">
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: data.retail }} />
          </TabsContent>
          <TabsContent value="institutional">
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: data.institutional }} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

