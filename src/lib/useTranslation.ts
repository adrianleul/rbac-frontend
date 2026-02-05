import { useLanguage } from './LanguageContext'

const translations = {
  en: {
    museumTicketPurchase: "Museum Ticket Purchase",

    selectTicketType: "Select Ticket Type",
    rulesAndRegulations: "Rules & Regulations",
    dateAndTime: "Date & Time",
    visitorInformation: "Visitor Information",
    personalDetails: "Personal Details",
    payment: "Payment",
    confirmation: "Confirmation",

    ticketTypeDescription: "Choose the type of ticket that best suits your visit to our museum. We offer different options to enhance your experience.",

    ticketTypes: {
    1: {
      name: "Regular",
      remark: "Standard museum access with all permanent exhibitions"
    },
    2: {
      name: "VIP",
      remark: "Premium access with special exhibitions and guided tour"
    },
    3: {
      name: "Student Group",
      remark: "For group of students, wedding, graduation and birthday"
    }
  },
  visitPlaces: {
    MainGallery: "Main Gallery",
    CarMuseum: "Car Museum",
    SwordMuseum: "Sword Museum"
  },

    rulesAgreement: 'Rules and Regulations',
    rulesAgreementPrompt: "Please read and agree to the following rules and regulations before proceeding with your ticket purchase.",
    rulesAgreementNotice: "By agreeing to these rules, you acknowledge that violation may result in being asked to leave the premises without refund.",
    agreeToRules: 'I have read and agree to the museum rules and regulations.',
    selectDateTime: 'Select Date and Time',
    selectDate: 'Select Date',
    selectTime: 'Select Time',

    visitorType: 'Visitor Type',
    local: 'Local',
    nonLocal: 'Tourist / Non-local',
    groupSize: 'Group Size (10-50)',
    infoText: "Please provide information about your visit to help us serve you better.",
    selectResidency: "Select Residency.",
    localInfo: "Local residents may be eligible for special discounts. Proof of residency may be required at entry.",
    nonLocalInfo: "Non-local visitors must provide contact information for their visit.",
    localBringID: "Please bring a valid ID or proof of residency to verify your local status.",
    nonLocalBringID: "Please bring a valid Passport.",
    selectTicketPrice: "Select ticket price",
    groupTicketAmount: "Amount of Group Ticket",
    minGroupSize: "Minimum group size",
    maxGroupSize: "Maximum group size",
    groupTicketAlert: "Group visits allow all members to enter together under a single contact person.",

    isLocal: "Please provide your contact information. For local individual visitors, this is optional but recommended.",
    isNonLocal: "Please provide your contact information. All fields are required for non-local visitors.",

    personalInfo: "Personal Information",
    contactInfoPrompt: "Please provide your contact information. For local individual visitors, this is optional but recommended.",
    groupContactNote: "As the contact person for this group, you will be responsible for all members of your group during the visit.",
    newsletterPrompt: "Subscribe to our newsletter for updates on exhibitions and events",
    privacyNotice: "Your personal information is protected under our Privacy Policy. We will only use your contact information for ticket-related communications unless you opt in to our newsletter.",

    visitorDetails: 'Visitor Details',
    fullName: 'Full Name',
    email: 'Email',
    phone: 'Phone Number',
    nationality: 'Nationality',

    card: "Credit / Debit Card",
    cardNote: "Pay securely with your card",
    bank: "Bank Transfer",
    bankNote: "Pay via bank transfer",      
    paypal: "PayPal",
    paypalNote: "Pay with your PayPal account",
    cash: "Pay at Museum",
    cashNote: "Pay in cash upon arrival",

    cardDetails: "Card Details",
    bankInstructions: "Please use the following bank details to complete your transfer:",

    cardNumber: "Card Number",
    cardholderName: "Cardholder Name",
    expiryDate: "Expiry Date",

    bankMuseum: "Bank: National Museum Bank",
    accountName: "Account Name: National Museum",
    accountNumber: "Account Number: 1234567890",
    reference: "Reference: Your Name + Visit Date",

    paypalRedirect: "You will be redirected to PayPal to complete your payment after clicking \"Process Payment\".",
    cashArrivalNote: "Your tickets will be reserved, but payment must be made in cash upon arrival at the museum. Please arrive at least 15 minutes before your scheduled time.",
    quantity: "Quantity",
    total: "Total",
    successTitle: "Payment Successful!",
    successMessage: "Your payment has been processed successfully. Please proceed to the next step to complete your purchase.",
    transactionId: "Transaction ID:",

    selectPrompt: "Please select your preferred payment method and currency to complete your purchase.",
    method: "Payment Method",
    currency: " Currency",
    price: " Price",
    numOfTik: "Number of Tickets",
    summary: "Order Summary",
    emailNote: "Your tickets will be sent to your email after successful payment.",

    bookingConfirmed: "Booking Confirmed!",
    bookingSuccessMessage: "Your museum tickets have been successfully booked. Please check your email for the ticket details.",
    bookingDetails: "Booking Details",
    confirmationNumber: "Confirmation Number",
    visitDate: "Visit Date",
    visitTime: "Visit Time",
    ticketType: "Ticket Type",
    numberOfTickets: "Number of Tickets",
    paymentMethod: "Payment Method",
    importantInformation: "Important Information",
    arrivalTime: "Arrival Time",
    arrivalTimeInstruction: "Please arrive at least 15 minutes before your scheduled time slot.",
    ticketValidation: "Ticket Validation",
    ticketValidationInstruction: "Present your QR code at the entrance for validation. Digital or printed tickets are accepted.",
    cancellationPolicy: "Cancellation Policy",
    cancellationPolicyText: "Tickets are non-refundable. Date changes may be accommodated with at least 48 hours notice.",
    groupVisits: "Group Visits",
    groupVisitsInstruction: "For group tickets, all members must enter together with the contact person present.",
    qrCode: "QR Code",
    print: "Print",
    download: "Download",
    orderSummary: "Order Summary",
    item: "Item",
    ticket: "Ticket",
    emailReceipt: "Email Receipt",
    thankYou: "Thank you for your purchase! We look forward to welcoming you to our museum.",

    congratulations: 'Congratulations!',
    confirmationDetails: 'You have successfully completed your ticket purchase.',
    lang: 'en'
  },
  am: {
    museumTicketPurchase: "የሙዚየም ቲኬት ግዢ",
    selectTicketType: "የቲኬት አይነት ይምረጡ",
      rulesAndRegulations: "ደንቦች እና መመሪያዎች",
      dateAndTime: "ቀን እና ሰዓት",
      visitorInformation: "የጎብኚ መረጃ",
      personalDetails: "የግል ዝርዝሮች",
      payment: "ክፍያ",
      confirmation: "ማረጋገጫ",

      ticketTypeDescription: "ለሙዚየሙ ጉብኝትዎ በተስተናጋጅ መንገድ የሚስማማውን የቲኬት አይነት ይምረጡ። እርስዎን በተሻለ ሁኔታ ለማገልገል ተለያዩ አማራጮችን አቀርባለን።",

      "ticketTypes": {
    "1": {
      "name": "መደበኛ",
      "remark": "ቋሚ ትስስሮች ያሉባቸውን ክፍሎች ለማየት መዳረሻ"
    },
    "2": {
      "name": "ቪአይፒ",
      "remark": "ልዩ ትስስሮችን እና መመሪያ ጉብኝትን የሚያካትት መዳረሻ"
    },
    "3": {
      "name": "የተማሪ ቡድን",
      "remark": "ለተማሪዎች፣ ሰርግ፣ መመረቂያ እና የበዓል ቡድኖች"
    }
  },
  "visitPlaces": {
    "Main Gallery": "ዋና ማዕከል",
    "Car Museum": "የመኪና ሙዚየም",
    "Sword Museum": "የሰይፍ ሙዚየም"
  },

    rulesAgreement: 'ደንቦች እና ህጎች',
    rulesAgreementPrompt: "እባክዎን ቲኬትዎን ከማግዛትዎ በፊት የሚከተሉትን ደንቦች እና መመሪያዎች ያንብቡና ይስማሙ።",
    rulesAgreementNotice: "እነዚህን ደንቦች በመስማማትዎ ከፍተኛ የሆነ ተግባራዊ ጥፋት እንደሚኖረው ትችላላችሁ፣ እና እርስዎ ከመመረቂያ ቦታው ማስወገድ እንደሚከተል ይናወሳሉ።",
    agreeToRules: 'የሙዚየሙን ደንቦች አንብቤ ተስማምቻለሁ።',

    isLocal: "እባክዎ የእርስዎን የመገኛ መረጃ ያቅርቡ። ለአካባቢ ውስጥ የሚገኙ ግለሰቦች ይህ አማራጭ ነው፣ ነገር ግን ማቅረብ ይመከራል።",
    isNonLocal: "እባክዎ የእርስዎን የመገኛ መረጃ ያቅርቡ። ለአካባቢ ውጭ ጎብኚዎች ሁሉም መረጃዎች አስፈላጊ ናቸው።",

    personalInfo: "የግል መረጃ",
  contactInfoPrompt: "እባክዎ የእርስዎን የመገኛ መረጃ ያቅርቡ። ለአካባቢ ውስጥ የሚገኙ ግለሰቦች ይህ አማራጭ ነው፣ ነገር ግን ማቅረብ ይመከራል።",
  groupContactNote: "እንደ ቡድኑ ዋና ኃላፊ ሰው፣ በጉብኝት ወቅት ላይ ሁሉም አባላት ተጠያቂ እንደሆኑ ይታወቃል።",
  newsletterPrompt: "ስለ ትዕይንቶች እና ክስተቶች ዝማኔ መረጃ ለማግኘት ዜና ወረቀታችንን ይመዝገቡ",
  privacyNotice: "የእርስዎ የግል መረጃ በየእኛ የመረጃ ግላዊነት ፖሊሲ መሠረት የተጠበቀ ነው። እርስዎ ለዜና ወረቀታችን ከተመዘገቡ በስተቀር የቲኬት ግንኙነቶች ብቻ ነው የሚጠቀመው።",
    
   selectPrompt: "እባክዎ ግዢዎን ለማጠናቀቅ የሚመረጡትን የመክፈያ ዘዴ እና ምንዛሬ ይምረጡ።",
    method: "የክፍያ ዘዴ",
    currency: " ምንዛሬ",
    price: " ዋጋ",
    numOfTik: "የቲከት ብዛት",
    summary: "የትዕዛዝ ማጠቃለያ",
    emailNote: "ከተሳካ ክፍያ በኋላ ቲኬቶችዎ ወደ ኢሜልዎ ይላካሉ።",

  selectDateTime: 'ቀን እና ሰዓት ይምረጡ',
    selectDate: 'ቀን ይምረጡ',
    selectTime: 'ሰዓት ይምረጡ',

    visitorType: 'የጎብኚው አይነት',
    local: 'የአካባቢ',
    nonLocal: 'እንግዳ / ከውጭ',
    groupSize: 'የቡድን መጠን (10-50)',
    infoText: "እኛ የተሻለ አገልግሎት እንድንድንሰጥ፣ እባኮትን ስለጉብኝትዎ መረጃ ያቅርቡ።",
    selectResidency: "የመኖሪያ ሁኔታ ይምረጡ",
    localInfo: "የአካባቢ ነዋሪዎች ለአዋቂ ቅናሾች ሊያመለከቱ ይችላሉ። የመኖሪያ ማረጋገጫ በመግቢያ ላይ ይፈለጋል።",
    nonLocalInfo: "ከአካባቢው ውጭ የመጡ ጎብኚዎች ለጉብኝታቸው የመገኛ መረጃ ማቅረብ አስፈላጊ ነው።",
    localBringID: "እባኮትን የህጋዊ መታወቂያ ወይም የመኖሪያ ማረጋገጫ ያመጡ እንዲሁም የአካባቢ ሁኔታዎን ለማረጋገጥ።",
    nonLocalBringID: "እባክዎን ትክክለኛ ፓስፖርት ያምጡ።",
    selectTicketPrice: "የቲኬት ዋጋ ይምረጡ",
    groupTicketAmount: "የቡድን ቲኬት ብዛት",
    minGroupSize: "ዝቅተኛው የቡድን መጠን",
    maxGroupSize: "ከፍተኛው የቡድን መጠን",
    groupTicketAlert: "የቡድን ጉብኝቶች ሁሉም አባላት በአንድ የእውቂያ ሰው በኩል በአንድነት ማምጣትን ያስችላሉ።",

    visitorDetails: 'የጎብኚው ዝርዝሮች',
    fullName: 'ሙሉ ስም',
    email: 'ኢሜል',
    phone: 'ስልክ ቁጥር',
    nationality: 'ዜግነት',

    card:  "የክሬዲት / ዲቢት ካርድ",
    cardNote: "በካርድዎ በደህና ይክፈሉ",
    bank: "ባንክ ማስተላለፊያ",
    bankNote: "በባንክ ማስተላለፊያ ይክፈሉ",      
    paypal: "PayPal",
    paypalNote: "በ PayPal መለያዎ ይክፈሉ",
    cash: "በሙዚየም ይክፈሉ",
    cashNote: "ከመጡ በኋላ በብር ይክፈሉ",

    cardDetails: "የካርድ ዝርዝሮች",
    bankInstructions: "ማስተላለፊያውን ለማጠናቀቅ ከዚህ ባንክ መረጃ ይጠቀሙ፦",

    cardNumber: "የካርድ ቁጥር",
    cardholderName: "የካርድ ባለቤት ስም",
    expiryDate: "የመጨረሻ ቀን",

    bankMuseum: "ባንክ፡ የብሔራዊ ሙዚየም ባንክ",
    accountName: "የመለያ ስም፡ የብሔራዊ ሙዚየም",
    accountNumber: "የመለያ ቁጥር፡ 1234567890",
    reference: "ማጣቀሻ፡ ስምዎ + የጉብኝት ቀን",

    paypalRedirect: "የ\"ክፍያ ማከናወን\" አዝራርን ከጫኑ በኋላ ወደ PayPal ትገለባላችሁ።",
    cashArrivalNote: "ቲኬቶችዎ ይቀያያሉ፣ ግን ክፍያው በሙዚየሙ ላይ በብር ማድረግ አለበት። ከተመደበው ጊዜ በፊት ቢያንስ 15 ደቂቃ ቀደም ብለው ይደርሱ።",
    quantity: "ብዛት",
    total: "ጠቅላላ",
    successTitle: "ክፍያው ተሳክቷል!",
    successMessage: "ክፍያው በተሳካ ሁኔታ ተከናውኗል። ግዢዎን ለማጠናቀቅ ወደ ቀጣዩ እርምጃ ይቀጥሉ።",
    transactionId: "የግብይት መለያ፡",

    

  bookingConfirmed: "ቦቅኪንግ ተሳክቷል!",
  bookingSuccessMessage: "የሙዚየሙ ቲኬቶችዎ በተሳካ ሁኔታ ተቀድተዋል። እባኮትን ዝርዝሩን በኢሜይልዎ ያረጋግጡ።",
  bookingDetails: "የቦቅኪንግ ዝርዝሮች",
  confirmationNumber: "የማረጋገጫ ቁጥር",
  visitDate: "የጉብኝት ቀን",
  visitTime: "የጉብኝት ሰዓት",
  ticketType: "የቲኬት አይነት",
  numberOfTickets: "የቲኬቶች ብዛት",
  paymentMethod: "የክፍያ ዘዴ",
  importantInformation: "አስፈላጊ መረጃ",
  arrivalTime: "የመቅረብ ሰዓት",
  arrivalTimeInstruction: "እባኮትን ከታች በያለው የተሰጠ ሰዓት 15 ደቂቃ በፊት ይደርሱ።",
  ticketValidation: "የቲኬት ማረጋገጫ",
  ticketValidationInstruction: "የQR ኮድዎን በመነሻ ቦታ ያሳዩ። ዲጂታል ወይም የታተመ ቲኬት ይቀበላሉ።",
  cancellationPolicy: "የመሰረዝ ፖሊሲ",
  cancellationPolicyText: "ቲኬቶች አይመለሱም። ቀን ለመቀየር በቢዝነስ ቀናት 48 ሰአታት በፊት መጠየቅ ይቻላል።",
  groupVisits: "የቡድን ጉብኝት",
  groupVisitsInstruction: "ለየቡድን ቲኬት በተመለከተ ሁሉም አባላት ከመገኘት ከፊት ከኮንታክት ሰው ጋር መግባት አለባቸው።",
  qrCode: "QR ኮድ",
  print: "አትም",
  download: "አውርድ",
  orderSummary: "የትእዛዝ መጠቀሚያ",
  item: "ንጥል",
  ticket: "ቲኬት",
  emailReceipt: "የኢሜይል መቀበያ",
  thankYou: "ስለግዢዎ እናመሰግናለን! ወደ ሙዚየሙ በደህና እንኳን ደህና መጡ እንላለን።",

    congratulations: 'እንኳን ደስ አለዎት!',
    confirmationDetails: 'የቲኬት ግዢዎን በተሳካ ሁኔታ አጠናቀቁ።',
    lang: 'am'
  }
}

export const useTranslation = () => {
  const { language } = useLanguage()

  const t = (key: keyof typeof translations['en']) => {
    return translations[language][key] || key
  }

  return { t }
}
