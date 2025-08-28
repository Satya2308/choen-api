import { Inject, Injectable } from "@nestjs/common"
import { CreateClassroomDto } from "./dto/create-classroom.dto"
import { UpdateClassroomDto } from "./dto/update-classroom.dto"
import * as schema from "db/schema"
import { Database } from "db/type"
import { and, eq, sql } from "drizzle-orm"
import { AssignTeacherDto } from "./dto/assign-teacher.dto"
import { TimeslotWithAssignments } from "./type"
import * as ExcelJS from "exceljs"

@Injectable()
export class ClassroomService {
  constructor(@Inject("DATABASE_CONNECTION") private readonly db: Database) {}
  async create(createClassroomDto: CreateClassroomDto) {
    const classroomSchema = schema.classroom
    return await this.db
      .insert(classroomSchema)
      .values(createClassroomDto)
      .returning()
      .then(res => res[0])
  }

  async assignTeacher(
    classroomId: number,
    yearId: number,
    assignTeacherDto: AssignTeacherDto
  ) {
    const { timeslotId, teacherId, action, day } = assignTeacherDto
    const classAssignmentDb = schema.classAssignment
    if (action === "REMOVE" || !teacherId) {
      await this.db
        .delete(classAssignmentDb)
        .where(
          and(
            eq(classAssignmentDb.classroomId, classroomId),
            eq(classAssignmentDb.timeslotId, timeslotId),
            eq(classAssignmentDb.day, day),
            eq(classAssignmentDb.yearId, yearId)
          )
        )
      return { message: "Assignment removed" }
    }
    await this.db
      .insert(classAssignmentDb)
      .values({ classroomId, timeslotId, teacherId, day, yearId })
      .onConflictDoUpdate({
        target: [
          classAssignmentDb.classroomId,
          classAssignmentDb.timeslotId,
          classAssignmentDb.day,
          classAssignmentDb.yearId
        ],
        set: { teacherId, updatedAt: new Date() }
      })
    return { message: "Teacher assigned successfully" }
  }

  async findAll(yearId: number) {
    const classroomSchema = schema.classroom
    const teacherSchema = schema.teacher
    return await this.db
      .select({
        id: classroomSchema.id,
        name: classroomSchema.name,
        teacher: {
          id: teacherSchema.id,
          name: schema.teacher.name,
          code: teacherSchema.code
        }
      })
      .from(classroomSchema)
      .leftJoin(
        teacherSchema,
        eq(classroomSchema.leadTeacherId, teacherSchema.id)
      )
      .where(eq(classroomSchema.yearId, yearId))
  }

  async findOne(id: number) {
    const classroomSchema = schema.classroom
    const teacherSchema = schema.teacher
    return await this.db
      .select({
        id: classroomSchema.id,
        name: classroomSchema.name,
        teacher: {
          id: teacherSchema.id,
          name: schema.teacher.name,
          code: schema.teacher.code
        }
      })
      .from(classroomSchema)
      .leftJoin(
        teacherSchema,
        eq(classroomSchema.leadTeacherId, teacherSchema.id)
      )
      .where(eq(classroomSchema.id, id))
      .then(res => res[0])
  }

  async update(id: number, updateClassroomDto: UpdateClassroomDto) {
    const classroomSchema = schema.classroom
    await this.db
      .update(classroomSchema)
      .set(updateClassroomDto)
      .where(eq(classroomSchema.id, id))
      .returning()
      .then(res => res[0])
    return { message: "ទិន្នន័យថ្នាក់ត្រូវបានផ្លាស់ប្តូរដោយជោគជ័យ" }
  }

  async remove(id: number) {
    const classroomSchema = schema.classroom
    await this.db
      .delete(classroomSchema)
      .where(eq(classroomSchema.id, id))
      .returning()
      .then(res => res[0])
    return { message: "ទិន្នន័យថ្នាក់ត្រូវបានលុបដោយជោគជ័យ" }
  }

  async getDuration(classroomId: number) {
    const classroomDb = schema.classroom
    const yearDb = schema.year
    return this.db
      .select({ classDuration: yearDb.classDuration })
      .from(classroomDb)
      .innerJoin(yearDb, eq(yearDb.id, classroomDb.yearId))
      .where(eq(classroomDb.id, classroomId))
      .limit(1)
      .then(res => res[0])
  }

  async findTimetable(
    classroomId: number,
    yearId: number
  ): Promise<TimeslotWithAssignments[]> {
    const duration = await this.getDuration(classroomId)
    if (!duration) throw new Error("Classroom not found")
    const result = await this.db.execute(sql<TimeslotWithAssignments[]>`
    SELECT 
      ts.id,
      ts.label,
      ts."sortOrder" AS "sortOrder",
      json_build_object(
        'monday', json_build_object('teacher', 
          CASE WHEN ca_mon."teacherId" IS NOT NULL 
          THEN json_build_object('id', ca_mon."teacherId", 'name', t_mon.name, 'code', t_mon.code) 
          ELSE null END
        ),
        'tuesday', json_build_object('teacher', 
          CASE WHEN ca_tue."teacherId" IS NOT NULL 
          THEN json_build_object('id', ca_tue."teacherId", 'name', t_tue.name, 'code', t_tue.code) 
          ELSE null END
        ),
        'wednesday', json_build_object('teacher', 
          CASE WHEN ca_wed."teacherId" IS NOT NULL 
          THEN json_build_object('id', ca_wed."teacherId", 'name', t_wed.name, 'code', t_wed.code) 
          ELSE null END
        ),
        'thursday', json_build_object('teacher', 
          CASE WHEN ca_thu."teacherId" IS NOT NULL 
          THEN json_build_object('id', ca_thu."teacherId", 'name', t_thu.name, 'code', t_thu.code) 
          ELSE null END
        ),
        'friday', json_build_object('teacher', 
          CASE WHEN ca_fri."teacherId" IS NOT NULL 
          THEN json_build_object('id', ca_fri."teacherId", 'name', t_fri.name, 'code', t_fri.code) 
          ELSE null END
        ),
        'saturday', json_build_object('teacher', 
          CASE WHEN ca_sat."teacherId" IS NOT NULL 
          THEN json_build_object('id', ca_sat."teacherId", 'name', t_sat.name, 'code', t_sat.code) 
          ELSE null END
        )
      )::jsonb AS assignments
    FROM timeslot ts
    LEFT JOIN "classAssignment" ca_mon ON ca_mon."timeslotId" = ts.id 
      AND ca_mon."classroomId" = ${classroomId} 
      AND ca_mon."yearId" = ${yearId}
      AND ca_mon.day = 'monday'
    LEFT JOIN teacher t_mon ON t_mon.id = ca_mon."teacherId"
    LEFT JOIN "classAssignment" ca_tue ON ca_tue."timeslotId" = ts.id 
      AND ca_tue."classroomId" = ${classroomId} 
      AND ca_tue."yearId" = ${yearId}
      AND ca_tue.day = 'tuesday'
    LEFT JOIN teacher t_tue ON t_tue.id = ca_tue."teacherId"
    LEFT JOIN "classAssignment" ca_wed ON ca_wed."timeslotId" = ts.id 
      AND ca_wed."classroomId" = ${classroomId} 
      AND ca_wed."yearId" = ${yearId}
      AND ca_wed.day = 'wednesday'
    LEFT JOIN teacher t_wed ON t_wed.id = ca_wed."teacherId"
    LEFT JOIN "classAssignment" ca_thu ON ca_thu."timeslotId" = ts.id 
      AND ca_thu."classroomId" = ${classroomId} 
      AND ca_thu."yearId" = ${yearId}
      AND ca_thu.day = 'thursday'
    LEFT JOIN teacher t_thu ON t_thu.id = ca_thu."teacherId"
    LEFT JOIN "classAssignment" ca_fri ON ca_fri."timeslotId" = ts.id 
      AND ca_fri."classroomId" = ${classroomId} 
      AND ca_fri."yearId" = ${yearId}
      AND ca_fri.day = 'friday'
    LEFT JOIN teacher t_fri ON t_fri.id = ca_fri."teacherId"
    LEFT JOIN "classAssignment" ca_sat ON ca_sat."timeslotId" = ts.id 
      AND ca_sat."classroomId" = ${classroomId} 
      AND ca_sat."yearId" = ${yearId}
      AND ca_sat.day = 'saturday'
    LEFT JOIN teacher t_sat ON t_sat.id = ca_sat."teacherId"
    WHERE ts.duration = ${duration.classDuration}
    ORDER BY ts."sortOrder"
  `)
    return result.rows
  }

  async getInfo(classroomId: number) {
    const classroomDb = schema.classroom
    const yearDb = schema.year
    return await this.db
      .select({
        name: classroomDb.name,
        year: {
          name: yearDb.name,
          startDateKh: yearDb.startDateKh,
          startDateEng: yearDb.startDateEng
        }
      })
      .from(classroomDb)
      .innerJoin(yearDb, eq(yearDb.id, classroomDb.yearId))
      .where(eq(classroomDb.id, classroomId))
      .then(res => res[0])
  }

  async exportTimetableToExcel(
    classroomId: number,
    yearId: number
  ): Promise<Buffer> {
    const [classroomInfo, timeslots] = await Promise.all([
      this.getInfo(classroomId),
      this.findTimetable(classroomId, yearId)
    ])
    const workbook = new ExcelJS.Workbook()
    // Create workbook and worksheet
    const worksheet = workbook.addWorksheet("Timetable")

    worksheet.getRow(1).height = 80
    worksheet.getRow(2).height = 80
    worksheet.getRow(3).height = 80
    worksheet.getRow(4).height = 80
    worksheet.getRow(9).height = 80
    worksheet.getRow(10).height = 200

    worksheet.mergeCells("G1:H1")
    const rightTitle1Cell = worksheet.getCell("G1")
    rightTitle1Cell.value = "ព្រះរាជាណាចក្រកម្ពុជា"
    rightTitle1Cell.font = { name: "Khmer OS Muol Light", bold: true, size: 12 }
    rightTitle1Cell.alignment = { horizontal: "center", vertical: "middle" }

    worksheet.mergeCells("G2:H2")
    const rightTitle2Cell = worksheet.getCell("G2")
    rightTitle2Cell.value = "ជាតិ សាសនា ព្រះមហាក្សត្រ"
    rightTitle2Cell.font = { name: "Khmer OS Muol Light", bold: true, size: 12 }
    rightTitle2Cell.alignment = { horizontal: "center", vertical: "middle" }

    worksheet.mergeCells("A2:C2")
    const leftTitle1Cell = worksheet.getCell("A2")
    leftTitle1Cell.value = "មន្ទីរអប់រំ យុវជន និងកីឡារាជធានីភ្នំពេញ"
    leftTitle1Cell.font = { name: "Khmer OS Muol Light", bold: true, size: 12 }
    leftTitle1Cell.alignment = { horizontal: "center", vertical: "middle" }

    worksheet.mergeCells("A3:C3")
    const leftTitle2Cell = worksheet.getCell("A3")
    leftTitle2Cell.value = "វិទ្យាល័យ ជា \u179F\u17CA\u17B8\u1798 បឹងកេងកង"
    leftTitle2Cell.font = { name: "Khmer OS Muol Light", bold: true, size: 12 }
    leftTitle2Cell.alignment = { horizontal: "center", vertical: "middle" }

    worksheet.mergeCells("E6:F6")
    const middleTitle1Cell = worksheet.getCell("E6")
    middleTitle1Cell.value = "កាលវិភាគប្រចាំសប្តាហ៍"
    middleTitle1Cell.font = {
      name: "Khmer OS Muol Light",
      bold: true,
      size: 12,
      underline: true
    }
    middleTitle1Cell.alignment = { horizontal: "center", vertical: "middle" }

    worksheet.mergeCells("E7:F7")
    const middleTitle2Cell = worksheet.getCell("E7")
    middleTitle2Cell.value = {
      richText: [
        {
          text: "ថ្នាក់ទី\u17D6 ",
          font: { size: 12, bold: true, name: "Khmer OS Muol Light" }
        },
        {
          text: `${classroomInfo.name}`,
          font: { size: 13, bold: true, name: "Khmer OS Muol Light" }
        }
      ]
    }
    middleTitle2Cell.alignment = {
      horizontal: "center",
      vertical: "middle"
    }

    worksheet.mergeCells("E8:F8")
    const middleTitle3Cell = worksheet.getCell("E8")
    middleTitle3Cell.value = `ឆ្នាំសិក្សា​ ${classroomInfo.year.name}`
    middleTitle3Cell.font = {
      name: "Khmer OS Muol Light",
      bold: true,
      size: 12
    }
    middleTitle3Cell.alignment = {
      horizontal: "center",
      vertical: "middle"
    }

    const days = [
      "ម៉ោង",
      "ច័ន្ទ",
      "អង្គារ",
      "ពុធ",
      "ព្រហស្បតិ៍",
      "សុក្រ",
      "សៅរ៍"
    ]

    // Add headers
    const headerRow = worksheet.getRow(10)
    days.forEach((day, index) => {
      const cell = headerRow.getCell(index + 2)
      cell.value = day
      cell.font = { bold: true, size: 12, name: "Khmer OS Muol Light" }
      cell.alignment = { horizontal: "center", vertical: "middle" }
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      }
    })

    // Set column widths
    worksheet.getColumn(1).width = 10
    worksheet.getColumn(2).width = 18
    for (let i = 3; i <= 8; i++) {
      worksheet.getColumn(i).width = 18 // Day columns
    }

    let currentRow = 11
    const halfIndex = Math.ceil(timeslots.length / 2) // midpoint
    const timeslotLength = timeslots.length
    timeslots.forEach((timeslot, rowIndex) => {
      if (rowIndex === halfIndex) {
        worksheet.mergeCells(currentRow, 2, currentRow, 8)
        const afternoonCell = worksheet.getRow(currentRow).getCell(2)
        afternoonCell.value = "រសៀល"
        afternoonCell.font = {
          size: 14,
          bold: true,
          name: "Khmer OS Muol Light"
        }
        afternoonCell.alignment = {
          horizontal: "center",
          vertical: "middle"
        }
        const rightCell = worksheet.getRow(currentRow).getCell(8)
        rightCell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" }
        }

        worksheet.getRow(currentRow).height = 200
        currentRow++
      }

      const row = worksheet.getRow(currentRow)

      // Timeslot label
      const timeslotCell = row.getCell(2)
      timeslotCell.value = timeslot.label
      timeslotCell.font = { size: 12, name: "Khmer OS Muol Light" }
      timeslotCell.alignment = { horizontal: "center", vertical: "middle" }
      timeslotCell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      }

      // Teacher assignments
      const dayKeys = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"
      ] as const
      dayKeys.forEach((dayKey, dayIndex) => {
        const cell = row.getCell(dayIndex + 3)
        const assignment = timeslot.assignments[dayKey]

        if (assignment.teacher) {
          cell.value = {
            richText: [
              {
                text: `${assignment.teacher.code}\n`,
                font: { size: 14, bold: true, name: "Khmer OS Muol Light" }
              },
              {
                text: `${assignment.teacher.name}`,
                font: { size: 10, bold: false, name: "Khmer OS Muol Light" }
              }
            ]
          }
          cell.alignment = {
            horizontal: "center",
            vertical: "middle",
            wrapText: true
          }
        } else {
          cell.value = ""
        }

        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" }
        }
      })

      row.height = 200
      currentRow++
    })

    const footerRow = 13 + timeslotLength
    const footerTitle = worksheet.getCell(footerRow, 2)
    footerTitle.value = "សំគាល់:"
    footerTitle.font = {
      name: "Khmer OS Muol Light",
      bold: true,
      size: 12,
      underline: true
    }

    const f1 = worksheet.getCell(footerRow + 1, 2)
    f1.value = {
      richText: [
        {
          text: "M : ",
          font: { size: 14, name: "Khmer OS Muol Light" }
        },
        {
          text: "គណិត",
          font: { size: 9, name: "Khmer OS Muol Light" }
        }
      ]
    }

    const f2 = worksheet.getCell(footerRow + 1, 3)
    f2.value = {
      richText: [
        {
          text: "K : ",
          font: { size: 14, name: "Khmer OS Muol Light" }
        },
        {
          text: "ខ្មែរ",
          font: { size: 9, name: "Khmer OS Muol Light" }
        }
      ]
    }

    const f3 = worksheet.getCell(footerRow + 1, 4)
    f3.value = {
      richText: [
        {
          text: "P : ",
          font: { size: 14, name: "Khmer OS Muol Light" }
        },
        {
          text: "រូបវិទ្យា",
          font: { size: 9, name: "Khmer OS Muol Light" }
        }
      ]
    }

    const f4 = worksheet.getCell(footerRow + 1, 5)
    f4.value = {
      richText: [
        {
          text: "C : ",
          font: { size: 14, name: "Khmer OS Muol Light" }
        },
        {
          text: "គីមី",
          font: { size: 9, name: "Khmer OS Muol Light" }
        }
      ]
    }

    const f5 = worksheet.getCell(footerRow + 1, 6)
    f5.value = {
      richText: [
        {
          text: "G : ",
          font: { size: 14, name: "Khmer OS Muol Light" }
        },
        {
          text: "ភូមិវិទ្យា",
          font: { size: 9, name: "Khmer OS Muol Light" }
        }
      ]
    }

    const f6 = worksheet.getCell(footerRow + 1, 7)
    f6.value = {
      richText: [
        {
          text: "H : ",
          font: { size: 14, name: "Khmer OS Muol Light" }
        },
        {
          text: "ប្រវត្តិវិទ្យា",
          font: { size: 9, name: "Khmer OS Muol Light" }
        }
      ]
    }

    const f7 = worksheet.getCell(footerRow + 1, 8)
    f7.value = {
      richText: [
        {
          text: "E : ",
          font: { size: 14, name: "Khmer OS Muol Light" }
        },
        {
          text: "អង់គ្លេស",
          font: { size: 9, name: "Khmer OS Muol Light" }
        }
      ]
    }

    const f8 = worksheet.getCell(footerRow + 2, 2)
    f8.value = {
      richText: [
        {
          text: "F : ",
          font: { size: 14, name: "Khmer OS Muol Light" }
        },
        {
          text: "បារាំង",
          font: { size: 9, name: "Khmer OS Muol Light" }
        }
      ]
    }

    const f9 = worksheet.getCell(footerRow + 2, 3)
    f9.value = {
      richText: [
        {
          text: "B : ",
          font: { size: 14, name: "Khmer OS Muol Light" }
        },
        {
          text: "ជីវះវិទ្យា",
          font: { size: 9, name: "Khmer OS Muol Light" }
        }
      ]
    }

    const f10 = worksheet.getCell(footerRow + 2, 4)
    f10.value = {
      richText: [
        {
          text: "Es : ",
          font: { size: 14, name: "Khmer OS Muol Light" }
        },
        {
          text: "ផែនដីវិទ្យា",
          font: { size: 9, name: "Khmer OS Muol Light" }
        }
      ]
    }

    const f11 = worksheet.getCell(footerRow + 2, 5)
    f11.value = {
      richText: [
        {
          text: "I : ",
          font: { size: 14, name: "Khmer OS Muol Light" }
        },
        {
          text: "ពលរដ្ធ​​-ទស្សនះ",
          font: { size: 9, name: "Khmer OS Muol Light" }
        }
      ]
    }

    const f12 = worksheet.getCell(footerRow + 2, 6)
    f12.value = {
      richText: [
        {
          text: "HE : ",
          font: { size: 14, name: "Khmer OS Muol Light" }
        },
        {
          text: "គេហវិទ្យា",
          font: { size: 9, name: "Khmer OS Muol Light" }
        }
      ]
    }

    const f13 = worksheet.getCell(footerRow + 2, 7)
    f13.value = {
      richText: [
        {
          text: "Ag : ",
          font: { size: 14, name: "Khmer OS Muol Light" }
        },
        {
          text: "កសិកម្ម",
          font: { size: 9, name: "Khmer OS Muol Light" }
        }
      ]
    }

    const f14 = worksheet.getCell(footerRow + 2, 8)
    f14.value = {
      richText: [
        {
          text: "Ar : ",
          font: { size: 14, name: "Khmer OS Muol Light" }
        },
        {
          text: "សិល្បះ",
          font: { size: 9, name: "Khmer OS Muol Light" }
        }
      ]
    }

    const f15 = worksheet.getCell(footerRow + 3, 2)
    f15.value = {
      richText: [
        {
          text: "Ed : ",
          font: { size: 14, name: "Khmer OS Muol Light" }
        },
        {
          text: "កីឡា",
          font: { size: 9, name: "Khmer OS Muol Light" }
        }
      ]
    }

    const f16 = worksheet.getCell(footerRow + 3, 3)
    f16.value = {
      richText: [
        {
          text: "W : ",
          font: { size: 14, name: "Khmer OS Muol Light" }
        },
        {
          text: "រោងជាង",
          font: { size: 9, name: "Khmer OS Muol Light" }
        }
      ]
    }

    worksheet.mergeCells(`F${footerRow + 4}:H${footerRow + 4}`)
    const f17 = worksheet.getCell(`F${footerRow + 4}`)
    f17.value = classroomInfo.year.startDateKh
    f17.font = {
      name: "Khmer OS",
      size: 12
    }
    f17.alignment = { horizontal: "center", vertical: "middle" }

    worksheet.mergeCells(`F${footerRow + 5}:H${footerRow + 5}`)
    const f18 = worksheet.getCell(`F${footerRow + 5}`)
    f18.value = classroomInfo.year.startDateEng
    f18.font = {
      name: "Khmer OS",
      size: 12
    }
    f18.alignment = { horizontal: "center", vertical: "middle" }

    worksheet.mergeCells(`B${footerRow + 6}:D${footerRow + 6}`)
    const f19 = worksheet.getCell(`B${footerRow + 6}`)
    f19.value = "សូមរក្សាសិទ្ធក្នុងការកែប្រែពេលមានការចាំបាច់"
    f19.font = {
      name: "Khmer OS",
      size: 10
    }
    f19.alignment = { vertical: "middle" }

    worksheet.mergeCells(`F${footerRow + 6}:H${footerRow + 6}`)
    const f20 = worksheet.getCell(`F${footerRow + 6}`)
    f20.value = "នាយកវិទ្យាល័យ"
    f20.font = {
      name: "Khmer OS Muol Light",
      bold: true,
      size: 12
    }
    f20.alignment = { horizontal: "center", vertical: "middle" }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer()
    return Buffer.from(buffer)
  }
}
