const DriverKYC = require('../models/DriverKYC');
const Driver = require('../models/Driver');
const AuditLog = require('../models/AuditLog');

const submitKYC = async (driverId, kycData) => {
  const existing = await DriverKYC.findOne({ driver_id: driverId });
  if (existing && existing.verification_status === 'VERIFIED') {
    throw new Error('KYC already verified');
  }

  if (existing) {
    Object.assign(existing, kycData, { verification_status: 'PENDING', verified_at: null, verified_by_admin: null });
    return existing.save();
  }

  return DriverKYC.create({ driver_id: driverId, ...kycData });
};

const verifyKYC = async (kycId, adminId, status) => {
  const kyc = await DriverKYC.findById(kycId);
  if (!kyc) throw new Error('KYC document not found');

  kyc.verification_status = status;
  kyc.verified_by_admin = adminId;
  kyc.verified_at = status === 'VERIFIED' ? new Date() : null;
  await kyc.save();

  if (status === 'VERIFIED') {
    await Driver.findByIdAndUpdate(kyc.driver_id, { approval_status: 'APPROVED' });
  } else if (status === 'REJECTED') {
    await Driver.findByIdAndUpdate(kyc.driver_id, { approval_status: 'REJECTED' });
  }

  await AuditLog.create({
    admin_id: adminId,
    action: `KYC_${status}`,
    target_id: kyc.driver_id,
  });

  return kyc;
};

const getKYCByDriver = async (driverId) => {
  return DriverKYC.findOne({ driver_id: driverId }).lean();
};

module.exports = { submitKYC, verifyKYC, getKYCByDriver };
