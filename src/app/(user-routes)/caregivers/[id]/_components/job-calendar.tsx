"use client"

import { useState } from "react"
import { Calendar, X, ChevronLeft, ChevronRight } from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  isWithinInterval,
  addMonths,
  isSameMonth,
  isToday,
} from "date-fns"

type Job = {
  id: string
  title: string
  client: string
  startDate: string
  endDate: string
  time: string
  location?: string
  description: string
  amount: number
  status: string
  color?: string
}

interface JobCalendarProps {
  jobs: Job[]
}

export default function JobCalendar({ jobs }: JobCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedJob, setSelectedJob] = useState<JobWithList | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const prevMonth = () => {
    setCurrentMonth(addMonths(currentMonth, -1))
  }

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const handleDateClick = (day: Date) => {
    const dayJobs = getJobsForDate(day)
    setSelectedDate(day)
    
    if (dayJobs.length === 1) {
      // If there's exactly one job, show the popup directly
      setSelectedJob(dayJobs[0])
    } else if (dayJobs.length > 1) {
      // Show job selection popup for the date
      setSelectedJob({ ...dayJobs[0], jobList: dayJobs })
    }
  }

  const getJobsForDate = (date: Date) => {
    return jobs.filter((job) => {
      const start = parseISO(job.startDate)
      const end = parseISO(job.endDate)
      return isWithinInterval(date, { start, end })
    })
  }

  const handleJobClick = (job: Job) => {
    setSelectedJob(job)
  }

  const closeJobDetails = () => {
    setSelectedJob(null)
  }
  
  // Get background color class based on job color
  const getBackgroundColorClass = (color?: string) => {
    switch(color) {
      case "pink": return "bg-pink-500";
      case "purple": return "bg-purple-500";
      case "blue": return "bg-blue-500";
      default: return "bg-teal-500";
    }
  }

  // Get background color class for job card
  const getCardBgClass = (color?: string) => {
    switch(color) {
      case "pink": return "bg-pink-50";
      case "purple": return "bg-purple-50";
      case "blue": return "bg-blue-50";
      default: return "bg-teal-50";
    }
  }

  // Get border color class for job card
  const getBorderClass = (color?: string) => {
    switch(color) {
      case "pink": return "border-pink-500";
      case "purple": return "border-purple-500";
      case "blue": return "border-blue-500";
      default: return "border-teal-500";
    }
  }

  // Add a TypeScript fix for the jobList property
  type JobWithList = Job & { jobList?: Job[] };
  
  return (
    <div className="rounded-xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-teal-600" />
          Job Calendar
        </h2>
        <div className="flex items-center gap-4">
          <button 
            onClick={prevMonth} 
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="font-semibold text-lg text-gray-800">{format(currentMonth, "MMMM yyyy")}</span>
          <button 
            onClick={nextMonth} 
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {monthDays.map((day, i) => {
          const dayJobs = getJobsForDate(day)
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const hasJobs = dayJobs.length > 0
          const isCurrentDay = isToday(day)
          const inCurrentMonth = isSameMonth(day, currentMonth)
          
          // Determine the color for the date cell background if it has jobs
          let cellColor = ""
          if (hasJobs) {
            const firstJobColor = dayJobs[0].color || "teal"
            switch (firstJobColor) {
              case "pink": cellColor = "bg-pink-100"; break;
              case "purple": cellColor = "bg-purple-100"; break;
              case "blue": cellColor = "bg-blue-100"; break;
              default: cellColor = "bg-teal-100"; break;
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleDateClick(day)}
              className={`
                h-14 rounded-lg flex flex-col items-center justify-center relative
                transition-all duration-200 outline-none
                ${!inCurrentMonth ? "opacity-40" : ""}
                ${isSelected 
                  ? "ring-2 ring-teal-500" 
                  : hasJobs 
                    ? cellColor
                    : "bg-white hover:bg-gray-50"}
                ${isCurrentDay && !hasJobs ? "ring-1 ring-teal-300" : ""}
              `}
            >
              <span className={`
                ${hasJobs ? "text-gray-800 font-medium" : "text-gray-600"}
                ${isSelected ? "font-bold" : ""}
                text-sm z-10
              `}>
                {format(day, "d")}
              </span>
              
              {hasJobs && dayJobs.length > 1 && (
                <div className="absolute bottom-1 text-xs font-medium text-gray-600">
                  {dayJobs.length} jobs
                </div>
              )}
              
              {hasJobs && dayJobs.length === 1 && (
                <div className="absolute bottom-1 text-xs truncate max-w-full px-1 text-gray-600">
                  {dayJobs[0].title.length > 8 ? `${dayJobs[0].title.substring(0, 8)}...` : dayJobs[0].title}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div
            className={`
              bg-white p-6 max-w-md w-full rounded-xl border-t-4
              ${getBorderClass(selectedJob.color)}
            `}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">{selectedJob.title}</h3>
              <button 
                onClick={closeJobDetails} 
                className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedJob.jobList ? (
              // Multiple jobs view for the date
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">{format(selectedDate || new Date(), "EEEE, MMMM d, yyyy")}</h4>
                <div className="space-y-2 mt-2">
                  {selectedJob.jobList.map((job) => (
                    <button
                      key={job.id}
                      onClick={() => handleJobClick(job)}
                      className={`
                        w-full text-left p-3 rounded-lg transition-all
                        ${getCardBgClass(job.color)} border-l-4 ${getBorderClass(job.color)}
                      `}
                    >
                      <div className="font-medium">{job.title}</div>
                      <div className="text-sm text-gray-600">Client: {job.client}</div>
                      <div className="flex justify-between mt-1">
                        <div className="text-xs text-gray-500">{job.time}</div>
                        <div className="text-sm font-medium text-green-600">${job.amount}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // Single job details view
              <div className="space-y-4">
                <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getBackgroundColorClass(selectedJob.color)} text-white font-bold`}>
                    {selectedJob.client.substring(0, 1).toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm text-gray-500">Client</div>
                    <div className="font-medium">{selectedJob.client}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-500">Start Date</div>
                    <div className="font-medium">{format(parseISO(selectedJob.startDate), "MMM d, yyyy")}</div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-500">End Date</div>
                    <div className="font-medium">{format(parseISO(selectedJob.endDate), "MMM d, yyyy")}</div>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Time</div>
                  <div className="font-medium">{selectedJob.time}</div>
                </div>

                {selectedJob.location && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-500">Location</div>
                    <div className="font-medium">{selectedJob.location}</div>
                  </div>
                )}

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Amount</div>
                  <div className="font-medium text-green-600 text-lg">${selectedJob.amount}</div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Description</div>
                  <div className="font-medium">{selectedJob.description}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}