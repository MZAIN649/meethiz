let express = require('express');
let router = express.Router();
router.use('/api/auth', require('./auth'));
router.use('/api/patient', require('./patient'));
router.use('/api/doctor', require('./doctor'));
router.use('/api/childreg', require('./childreg'));
router.use('/api/entity', require('./entity'));
router.use('/api/Nisab', require('./Nisab'));
router.use('/api/Refferal', require('./Refferal'));
router.use('/api/DoctorDetails', require('./DoctorDetails'));
router.use('/api/department', require('./department'));
router.use('/api/employee', require('./employee'));
router.use('/api/shifts', require('./shifts'));
router.use('/api/EmpDept', require('./EmployeeDept'));
router.use('/api/roles', require('./roles'));
router.use('/api/rights', require('./rights'));
router.use('/api/genNames',require('./genName'));
router.use('/api/storeitems',require('./storeitems'));
router.use('/api/item-category',require('./item-category'));
router.use('/api/store-item-rec',require('./store-item-rec'));
router.use('/api/vendor',require('./vendor'));
router.use('/api/stock',require('./stocks'));
router.use('/api/PurchasedOrder',require('./PurchasedOrder'));
router.use('/api/diabeteslog',require('./diabeteslog'));
router.use('/api/dashboard',require('./dashboard'));
router.use('/api/package',require('./package_meethizindagi'));
router.use('/api/internalConsumption',require('./internalConsumption'));
router.use('/api/order',require('./order'));
router.use('/api/report',require('./report'));
router.use('/api/hospital',require('./hospital'));
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Express'
  }); // one can render any view here
});
module.exports = router;