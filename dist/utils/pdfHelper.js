// src/utils/pdfHelper.ts
import PDFDocument from "pdfkit";
import streamBuffers from "stream-buffers";
export const generatePDFBuffer = (appointment, scheduledAt) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: "A4", margin: 50 });
        const bufferStream = new streamBuffers.WritableStreamBuffer();
        doc.pipe(bufferStream);
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        // Draw full-page border
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20)
            .lineWidth(2)
            .strokeColor("#08392e")
            .stroke();
        // Logo text top-right
        doc.fontSize(16)
            .fillColor("#08392e")
            .text("DrConnect", pageWidth - 130, 30, { align: "right" });
        // Title
        doc.fontSize(24)
            .fillColor("#08392e")
            .text("Appointment Receipt", 0, 80, { align: "center", underline: true });
        // Horizontal line
        doc.moveTo(50, 120)
            .lineTo(pageWidth - 50, 120)
            .strokeColor("#08392e")
            .lineWidth(1)
            .stroke();
        // Table-style info box
        const infoBoxY = 140;
        const tableTop = infoBoxY;
        const tableLeft = 50;
        const tableWidth = pageWidth - 100; // 50 margin both sides
        const col1Width = tableWidth / 3;
        const col2Width = tableWidth - col1Width;
        const rowHeight = 30;
        // Format scheduled date to readable format
        const appointmentDate = new Date(scheduledAt);
        const options = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        };
        const formattedDate = appointmentDate.toLocaleString("en-US", options);
        // Table header
        doc.fontSize(14).fillColor("#08392e").font("Helvetica-Bold");
        doc.text("Field", tableLeft, tableTop, { width: col1Width, align: "center" });
        doc.text("Details", tableLeft + col1Width, tableTop, { width: col2Width, align: "center" });
        // Header line
        doc.moveTo(tableLeft, tableTop + rowHeight - 5)
            .lineTo(tableLeft + tableWidth, tableTop + rowHeight - 5)
            .strokeColor("#08392e")
            .lineWidth(1)
            .stroke();
        // Table data
        doc.fontSize(12).fillColor("#000").font("Helvetica");
        const data = [
            ["Patient Name", appointment.patient.name],
            ["Doctor Name", appointment.doctor.name],
            ["Date & Time", formattedDate],
            ["Mode", "Offline"],
            ["Status", "Accepted"],
        ];
        data.forEach((row, i) => {
            const y = tableTop + rowHeight * (i + 1);
            doc.text(row[0], tableLeft, y, { width: col1Width, align: "center" });
            doc.text(row[1], tableLeft + col1Width, y, { width: col2Width, align: "center" });
            // Row separator
            doc.moveTo(tableLeft, y + rowHeight - 5)
                .lineTo(tableLeft + tableWidth, y + rowHeight - 5)
                .strokeColor("#08392e")
                .lineWidth(0.5)
                .stroke();
        });
        // Detailed notes
        let notesY = tableTop + rowHeight * (data.length + 1) + 20;
        doc.moveDown();
        doc.fontSize(12).fillColor("#08392e").text("Notes:", tableLeft, notesY, { align: "left", underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).fillColor("#000").text("1. Please arrive 10-15 minutes before your scheduled appointment.\n" +
            "2. Bring all previous medical reports, prescriptions, and lab results.\n" +
            "3. The offline appointment will be conducted in person at the clinic.\n" +
            "4. Keep this receipt safely for future reference and insurance purposes.\n" +
            "5. For rescheduling or cancellations, contact the clinic at least 24 hours in advance.\n" +
            "6. This receipt is valid proof of your confirmed appointment and cannot be duplicated.\n" +
            "7. All personal data is handled securely and in accordance with privacy regulations.\n", { align: "left", lineGap: 3 });
        // Terms & Conditions
        doc.moveDown(1);
        doc.fontSize(12).fillColor("#08392e").text("Terms & Conditions:", tableLeft, doc.y, { align: "left", underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).fillColor("#000").text("1. Appointment times may change due to emergencies; notifications will be sent.\n" +
            "2. All consultations are confidential; patient info will not be shared without consent.\n" +
            "3. DrConnect and clinics are not responsible for unforeseen delays.\n" +
            "4. Payments, if any, should be completed prior to the appointment unless agreed otherwise.\n" +
            "5. By attending this appointment, you agree to clinic rules and respect staff.\n", { align: "left", lineGap: 3 });
        // Footer
        doc.moveDown(2);
        doc.fontSize(12).fillColor("#08392e").text("Thank you for choosing DrConnect. Wishing you good health!", { align: "center" });
        doc.end();
        bufferStream.on("finish", () => {
            const pdfBuffer = bufferStream.getContents();
            if (pdfBuffer)
                resolve(pdfBuffer);
            else
                reject(new Error("Failed to generate PDF buffer"));
        });
        bufferStream.on("error", (err) => reject(err));
    });
};
