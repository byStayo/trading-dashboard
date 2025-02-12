"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Calendar, GraduationCap, BookOpen } from "lucide-react"

export default function StudentDashboardPage() {
  const [overallProgress, setOverallProgress] = useState(35)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>

      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
          <CardDescription>Track your journey towards your business major</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={overallProgress} className="w-full h-4 mb-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>0%</span>
            <span>{overallProgress}% Complete</span>
            <span>100%</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Completed</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42 / 120</div>
            <p className="text-xs text-muted-foreground">Credits</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.7</div>
            <p className="text-xs text-muted-foreground">Out of 4.0</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses In Progress</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Active courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Completion</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">May 2024</div>
            <p className="text-xs text-muted-foreground">Based on current pace</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="current-courses">
        <TabsList>
          <TabsTrigger value="current-courses">Current Courses</TabsTrigger>
          <TabsTrigger value="completed-courses">Completed Courses</TabsTrigger>
          <TabsTrigger value="upcoming-courses">Upcoming Courses</TabsTrigger>
        </TabsList>
        <TabsContent value="current-courses">
          <Card>
            <CardHeader>
              <CardTitle>Current Courses</CardTitle>
              <CardDescription>Courses you are currently enrolled in</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["Marketing Strategy", "Corporate Finance", "Business Ethics"].map((course, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{course}</h3>
                      <p className="text-sm text-muted-foreground">In progress</p>
                    </div>
                    <Badge>Active</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="completed-courses">
          <Card>
            <CardHeader>
              <CardTitle>Completed Courses</CardTitle>
              <CardDescription>Courses you have successfully finished</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["Introduction to Business", "Microeconomics", "Financial Accounting"].map((course, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{course}</h3>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                    <Badge variant="secondary">Passed</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="upcoming-courses">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Courses</CardTitle>
              <CardDescription>Recommended courses for your next semester</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["Operations Management", "International Business", "Strategic Management"].map((course, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{course}</h3>
                      <p className="text-sm text-muted-foreground">Recommended</p>
                    </div>
                    <Button size="sm">Enroll</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

