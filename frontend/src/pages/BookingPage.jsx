import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCheck, FiSearch, FiBriefcase, FiPlusCircle, FiCreditCard } from 'react-icons/fi'
import { setStep } from '../store/slices/bookingSlice'
import StepRoomSelect from '../components/booking/StepRoomSelect'
import StepGuestDetails from '../components/booking/StepGuestDetails'
import StepAddOns from '../components/booking/StepAddOns'
import StepSummary from '../components/booking/StepSummary'
import toast from 'react-hot-toast'

const STEPS = [
  { id: 1, label: 'Room', icon: FiSearch },
  { id: 2, label: 'Guest Details', icon: FiBriefcase },
  { id: 3, label: 'Add-ons', icon: FiPlusCircle },
  { id: 4, label: 'Review & Pay', icon: FiCreditCard },
]

export default function BookingPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { currentStep, selectedRoom } = useSelector((s) => s.booking)

  useEffect(() => {
    if (!selectedRoom) {
      toast.error('Please select a room first')
      navigate('/hotels')
    }
  }, [selectedRoom, navigate])

  if (!selectedRoom) return null

  return (
    <div className="min-h-screen pt-20 pb-16 bg-dark-950">
      <div className="page-container mt-8">
        {/* Progress Steps */}
        <div className="mb-10">
          <div className="flex items-center justify-center">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <motion.button
                  onClick={() => currentStep > step.id && dispatch(setStep(step.id))}
                  className={`flex flex-col items-center gap-2 group ${currentStep > step.id ? 'cursor-pointer' : 'cursor-default'}`}
                  whileHover={currentStep > step.id ? { scale: 1.05 } : {}}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    currentStep > step.id
                      ? 'bg-green-500 border-green-500 text-white'
                      : currentStep === step.id
                      ? 'border-primary-400 bg-primary-500/10 text-primary-400'
                      : 'border-dark-600 bg-dark-800 text-dark-500'
                  }`}>
                    {currentStep > step.id ? <FiCheck className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block transition-colors ${
                    currentStep === step.id ? 'text-primary-300' : currentStep > step.id ? 'text-green-400' : 'text-dark-500'
                  }`}>{step.label}</span>
                </motion.button>
                {index < STEPS.length - 1 && (
                  <div className={`h-0.5 w-12 sm:w-24 mx-2 transition-all duration-300 ${currentStep > step.id ? 'bg-green-500' : 'bg-dark-700'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && <StepRoomSelect />}
            {currentStep === 2 && <StepGuestDetails />}
            {currentStep === 3 && <StepAddOns />}
            {currentStep === 4 && <StepSummary />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
