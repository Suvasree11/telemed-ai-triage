const Question = require('../models/Question');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function ruleEngine(symptoms, age){
  symptoms = symptoms.toLowerCase();
  if(symptoms.includes('fever') && age < 12) return "Paracetamol Syrup";
  if(symptoms.includes('fever')) return "Paracetamol 500mg";
  if(symptoms.includes('cold')) return "Cetirizine 10mg";
  if(symptoms.includes('cough')) return "Dextromethorphan Syrup";
  return "Consult Doctor";
}

exports.askQuestion = async (req,res)=>{
  const {symptoms, age} = req.body;
  const recommendation = ruleEngine(symptoms, age);
  const q = await Question.create({symptoms, age, recommendation});
  res.json(q);
};

exports.getAll = async (req,res)=>{
  const data = await Question.find();
  res.json(data);
};

exports.generatePrescription = async (req,res)=>{
  const {name, symptoms, recommendation} = req.body;

  const doc = new PDFDocument();
  const filePath = path.join(__dirname, '../../prescription.pdf');
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(20).text("Telemedicine Prescription");
  doc.moveDown();
  doc.text("Patient Name: " + name);
  doc.text("Symptoms: " + symptoms);
  doc.text("Medicine: " + recommendation);
  doc.end();

  setTimeout(()=>{
    res.download(filePath);
  },1000);
};