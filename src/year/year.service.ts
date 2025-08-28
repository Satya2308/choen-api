import { Inject, Injectable } from "@nestjs/common"
import { CreateYearDto } from "./dto/create-year.dto"
import { UpdateYearDto } from "./dto/update-year.dto"
import * as schema from "db/schema"
import { Database } from "db/type"
import { eq, sql, and } from "drizzle-orm"
import { TimeslotWithAssignments } from "src/year/type"
import * as ExcelJS from "exceljs"

@Injectable()
export class YearService {
  constructor(@Inject("DATABASE_CONNECTION") private readonly db: Database) {}
  async create(createYearDto: CreateYearDto) {
    const yearSchema = schema.year
    return await this.db
      .insert(yearSchema)
      .values(createYearDto)
      .returning()
      .then(res => res[0])
  }

  async findAll() {
    const yearSchema = schema.year
    return await this.db.select().from(yearSchema)
  }

  async findOne(id: number) {
    const yearSchema = schema.year
    return await this.db
      .select()
      .from(yearSchema)
      .where(eq(yearSchema.id, id))
      .then(res => res[0])
  }

  async update(id: number, updateYearDto: UpdateYearDto) {
    const yearSchema = schema.year
    await this.db
      .update(yearSchema)
      .set(updateYearDto)
      .where(eq(yearSchema.id, id))
      .returning()
      .then(res => res[0])
    return { message: "ឆ្នាំត្រូវបានផ្លាស់ប្តូរដោយជោគជ័យ" }
  }

  async remove(id: number) {
    const yearSchema = schema.year
    await this.db
      .delete(yearSchema)
      .where(eq(yearSchema.id, id))
      .returning()
      .then(res => res[0])
    return { message: "ឆ្នាំត្រូវបានលុបដោយជោគជ័យ" }
  }

  async getDuration(yearId: number) {
    const yearDb = schema.year
    return this.db
      .select({ classDuration: yearDb.classDuration })
      .from(yearDb)
      .where(eq(yearDb.id, yearId))
      .limit(1)
      .then(res => res[0])
  }

  async findTimetable(
    teacherId: number,
    yearId: number
  ): Promise<TimeslotWithAssignments[]> {
    const duration = await this.getDuration(yearId)
    if (!duration) throw new Error("Year not found")
    const result = await this.db.execute(sql<TimeslotWithAssignments[]>`
      SELECT 
        ts.id,
        ts.label,
        ts."sortOrder" AS "sortOrder",
        json_build_object(
          'monday', json_build_object('classroom', 
            CASE WHEN ca_mon."classroomId" IS NOT NULL 
            THEN json_build_object('id', ca_mon."classroomId", 'name', c_mon.name) 
            ELSE null END
          ),
          'tuesday', json_build_object('classroom', 
            CASE WHEN ca_tue."classroomId" IS NOT NULL 
            THEN json_build_object('id', ca_tue."classroomId", 'name', c_tue.name) 
            ELSE null END
          ),
          'wednesday', json_build_object('classroom', 
            CASE WHEN ca_wed."classroomId" IS NOT NULL 
            THEN json_build_object('id', ca_wed."classroomId", 'name', c_wed.name) 
            ELSE null END
          ),
          'thursday', json_build_object('classroom', 
            CASE WHEN ca_thu."classroomId" IS NOT NULL 
            THEN json_build_object('id', ca_thu."classroomId", 'name', c_thu.name) 
            ELSE null END
          ),
          'friday', json_build_object('classroom', 
            CASE WHEN ca_fri."classroomId" IS NOT NULL 
            THEN json_build_object('id', ca_fri."classroomId", 'name', c_fri.name) 
            ELSE null END
          ),
          'saturday', json_build_object('classroom', 
            CASE WHEN ca_sat."classroomId" IS NOT NULL 
            THEN json_build_object('id', ca_sat."classroomId", 'name', c_sat.name) 
            ELSE null END
          )
        )::jsonb AS assignments
      FROM timeslot ts
      LEFT JOIN "classAssignment" ca_mon ON ca_mon."timeslotId" = ts.id 
        AND ca_mon."teacherId" = ${teacherId} 
        AND ca_mon."yearId" = ${yearId}
        AND ca_mon.day = 'monday'
      LEFT JOIN classroom c_mon ON c_mon.id = ca_mon."classroomId"
      LEFT JOIN "classAssignment" ca_tue ON ca_tue."timeslotId" = ts.id 
        AND ca_tue."teacherId" = ${teacherId} 
        AND ca_tue."yearId" = ${yearId}
        AND ca_tue.day = 'tuesday'
      LEFT JOIN classroom c_tue ON c_tue.id = ca_tue."classroomId"
      LEFT JOIN "classAssignment" ca_wed ON ca_wed."timeslotId" = ts.id 
        AND ca_wed."teacherId" = ${teacherId} 
        AND ca_wed."yearId" = ${yearId}
        AND ca_wed.day = 'wednesday'
      LEFT JOIN classroom c_wed ON c_wed.id = ca_wed."classroomId"
      LEFT JOIN "classAssignment" ca_thu ON ca_thu."timeslotId" = ts.id 
        AND ca_thu."teacherId" = ${teacherId} 
        AND ca_thu."yearId" = ${yearId}
        AND ca_thu.day = 'thursday'
      LEFT JOIN classroom c_thu ON c_thu.id = ca_thu."classroomId"
      LEFT JOIN "classAssignment" ca_fri ON ca_fri."timeslotId" = ts.id 
        AND ca_fri."teacherId" = ${teacherId} 
        AND ca_fri."yearId" = ${yearId}
        AND ca_fri.day = 'friday'
      LEFT JOIN classroom c_fri ON c_fri.id = ca_fri."classroomId"
      LEFT JOIN "classAssignment" ca_sat ON ca_sat."timeslotId" = ts.id 
        AND ca_sat."teacherId" = ${teacherId} 
        AND ca_sat."yearId" = ${yearId}
        AND ca_sat.day = 'saturday'
      LEFT JOIN classroom c_sat ON c_sat.id = ca_sat."classroomId"
      WHERE ts.duration = ${duration.classDuration}
      ORDER BY ts."sortOrder"
    `)
    return result.rows
  }

  async getInfo(teacherId: number, yearId: number) {
    const classAssignmentDb = schema.classAssignment
    const teacherDb = schema.teacher
    const yearDb = schema.year
    const classroomDb = schema.classroom
    return await this.db
      .select({
        name: teacherDb.name,
        code: teacherDb.code,
        subject: teacherDb.subject,
        year: {
          name: yearDb.name,
          startDateKh: yearDb.startDateKh,
          startDateEng: yearDb.startDateEng
        },
        classrooms: sql<string[]>`array_agg(distinct ${classroomDb.name})`
      })
      .from(teacherDb)
      .innerJoin(
        classAssignmentDb,
        eq(classAssignmentDb.teacherId, teacherDb.id)
      )
      .innerJoin(yearDb, eq(yearDb.id, classAssignmentDb.yearId))
      .innerJoin(classroomDb, eq(classroomDb.id, classAssignmentDb.classroomId))
      .where(
        and(
          eq(classAssignmentDb.yearId, yearId),
          eq(classAssignmentDb.teacherId, teacherId)
        )
      )
      .groupBy(teacherDb.id, yearDb.id)
      .then(res => res[0])
  }

  async exportTimetableToExcel(
    yearId: number,
    teacherId: number
  ): Promise<Buffer> {
    const [teacherInfo, timeslots] = await Promise.all([
      this.getInfo(teacherId, yearId),
      this.findTimetable(teacherId, yearId)
    ])
    const workbook = new ExcelJS.Workbook()
    // Create workbook and worksheet
    const worksheet = workbook.addWorksheet("Timetable")

    worksheet.getRow(1).height = 80
    worksheet.getRow(2).height = 80
    worksheet.getRow(3).height = 80
    worksheet.getRow(4).height = 80
    worksheet.getRow(7).height = 80
    worksheet.getRow(8).height = 80
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

    worksheet.mergeCells("G5:H5")
    const leftTitle3Cell = worksheet.getCell("G5")
    leftTitle3Cell.value = `ឆ្នាំសិក្សា​ ${teacherInfo.year.name}`
    leftTitle3Cell.font = {
      name: "Khmer OS Muol Light",
      bold: true,
      size: 12
    }
    leftTitle3Cell.alignment = { horizontal: "center", vertical: "middle" }

    worksheet.mergeCells("D6:F6")
    const mt1Cell = worksheet.getCell("D6")
    mt1Cell.value = "កាលវិភាគប្រចាំសប្តាហ៍"
    mt1Cell.font = {
      name: "Khmer OS Muol Light",
      bold: true,
      size: 12,
      underline: true
    }
    mt1Cell.alignment = { horizontal: "center", vertical: "middle" }

    worksheet.mergeCells("B7:D7")
    const mt2Cell = worksheet.getCell("B7")
    mt2Cell.value = `ឈ្មោះគ្រូ\u17D6 ${teacherInfo.name}`
    mt2Cell.font = {
      name: "Khmer OS Muol Light",
      bold: true,
      size: 12
    }
    mt2Cell.alignment = { vertical: "middle" }

    worksheet.mergeCells("B8:D8")
    const mt3Cell = worksheet.getCell("B8")
    mt3Cell.value = `បង្រៀនមុខវិជ្ជា\u17D6 ${teacherInfo.subject}`
    mt3Cell.font = {
      name: "Khmer OS Muol Light",
      bold: true,
      size: 12
    }
    mt3Cell.alignment = { vertical: "middle" }

    worksheet.mergeCells("B9:D9")
    const mt4Cell = worksheet.getCell("B9")
    const classroomsName = teacherInfo.classrooms.join(", ")
    mt4Cell.value = `បង្រៀនថ្នាក់ទី\u17D6  ${classroomsName}`
    mt4Cell.font = {
      name: "Khmer OS Muol Light",
      bold: true,
      size: 12
    }
    mt4Cell.alignment = { vertical: "middle" }

    const mt5Cell = worksheet.getCell("G7")
    mt5Cell.value = `លេខកូដ\u17D6`
    mt5Cell.font = {
      name: "Khmer OS Muol Light",
      bold: true,
      size: 12
    }
    mt5Cell.alignment = { horizontal: "right", vertical: "middle" }

    const mt6Cell = worksheet.getCell("H7")
    mt6Cell.value = `${teacherInfo.code}`
    mt6Cell.font = {
      name: "Khmer OS Muol Light",
      bold: true,
      size: 12
    }
    mt6Cell.alignment = { vertical: "middle" }

    const mt7Cell = worksheet.getCell("G8")
    mt7Cell.value = `បន្ទុកថ្នាក់\u17D6`
    mt7Cell.font = {
      name: "Khmer OS Muol Light",
      bold: true,
      size: 11
    }
    mt7Cell.alignment = { horizontal: "right", vertical: "middle" }

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

        if (assignment.classroom) {
          cell.value = `${assignment.classroom.name}`
          cell.font = { size: 12, bold: true, name: "Khmer OS Muol Light" }
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

    worksheet.mergeCells(`F${footerRow}:H${footerRow}`)
    const f1 = worksheet.getCell(`F${footerRow}`)
    f1.value = "ម៉ោងបង្រៀនចំនួន:.............ម៉ោង"
    f1.font = {
      name: "Khmer OS",
      size: 12
    }
    f1.alignment = { horizontal: "center", vertical: "middle" }

    worksheet.mergeCells(`F${footerRow + 1}:H${footerRow + 1}`)
    const f2 = worksheet.getCell(`F${footerRow + 1}`)
    f2.value = "ម៉ោងកំណត់ចំនួន:.............ម៉ោង"
    f2.font = {
      name: "Khmer OS",
      size: 12
    }
    f2.alignment = { horizontal: "center", vertical: "middle" }

    worksheet.mergeCells(`F${footerRow + 2}:H${footerRow + 2}`)
    const f3 = worksheet.getCell(`F${footerRow + 2}`)
    f3.value = "ម៉ោងបន្ថែមចំនួន:.............ម៉ោង"
    f3.font = {
      name: "Khmer OS",
      size: 12
    }
    f3.alignment = { horizontal: "center", vertical: "middle" }

    worksheet.mergeCells(`E${footerRow + 3}:H${footerRow + 3}`)
    const f4 = worksheet.getCell(`E${footerRow + 3}`)
    f4.value = `${teacherInfo.year.startDateKh}`
    f4.font = {
      name: "Khmer OS",
      size: 12
    }
    f4.alignment = { horizontal: "center", vertical: "middle" }

    worksheet.mergeCells(`E${footerRow + 4}:H${footerRow + 4}`)
    const f5 = worksheet.getCell(`E${footerRow + 4}`)
    f5.value = `${teacherInfo.year.startDateEng}`
    f5.font = {
      name: "Khmer OS",
      size: 12
    }
    f5.alignment = { horizontal: "center", vertical: "middle" }

    worksheet.mergeCells(`E${footerRow + 5}:H${footerRow + 5}`)
    const f6 = worksheet.getCell(`E${footerRow + 5}`)
    f6.value = "សាស្រ្តាចារ្យ"
    f6.font = {
      name: "Khmer OS",
      size: 12
    }
    f6.alignment = { horizontal: "center", vertical: "middle" }

    worksheet.mergeCells(`B${footerRow + 5}:D${footerRow + 5}`)
    const f7 = worksheet.getCell(`B${footerRow + 5}`)
    f7.value = "បានឃើញ និង ឯក​ភាព"
    f7.font = {
      name: "Khmer OS",
      size: 12
    }
    f7.alignment = { horizontal: "center", vertical: "middle" }

    worksheet.mergeCells(`B${footerRow + 6}:D${footerRow + 6}`)
    const f8 = worksheet.getCell(`B${footerRow + 6}`)
    f8.value = "នាយកវិទ្យាល័យ"
    f8.font = {
      name: "Khmer OS",
      size: 12
    }
    f8.alignment = { horizontal: "center", vertical: "middle" }

    worksheet.mergeCells(`G${footerRow + 7}:H${footerRow + 7}`)
    const f9 = worksheet.getCell(`G${footerRow + 7}`)
    f9.value = `${teacherInfo.name}`
    f9.font = {
      name: "Khmer OS",
      size: 12
    }
    f9.alignment = { horizontal: "center", vertical: "middle" }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer()
    return Buffer.from(buffer)
  }
}
