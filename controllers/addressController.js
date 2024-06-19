const Address = require('../models/addressModel');
const httpStatusText = require("../utils/httpStatusText");

exports.addAddress = async (req, res) => {
    try {
        const { address_usersid, address_name, address_city, address_street, address_lat, address_long } = req.body;

        const newAddress = new Address({
            address_usersid,
            address_name,
            address_city,
            address_street,
            address_lat,
            address_long
        });

        await newAddress.save();
        res.status(201).json({ status: httpStatusText.SUCCESS, data: newAddress });
    } catch (error) {
        res.status(500).json({ status: httpStatusText.FAIL, message: error.message });
    }
};

exports.deleteAddress = async (req, res) => {
    try {
        const { id } = req.body;

        const address = await Address.findByIdAndDelete(id);
        if (!address) {
            return res.status(404).json({ status: httpStatusText.FAIL, message: 'Address not found' });
        }

        res.status(200).json({ status: httpStatusText.SUCCESS, message: 'Address deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: httpStatusText.FAIL, message: error.message });
    }
};

exports.editAddress = async (req, res) => {
    try {
        const { id, address_name, address_city, address_street, address_lat, address_long } = req.body;

        const updatedAddress = await Address.findByIdAndUpdate(
            id,
            { address_name, address_city, address_street, address_lat, address_long },
            { new: true }
        );

        if (!updatedAddress) {
            return res.status(404).json({ status: httpStatusText.FAIL, message: 'Address not found' });
        }

        res.status(200).json({ status: httpStatusText.SUCCESS, data: updatedAddress });
    } catch (error) {
        res.status(500).json({ status: httpStatusText.FAIL, message: error.message });
    }
};

exports.viewAddresses = async (req, res) => {
    try {
        const { address_usersid } = req.body;

        const addresses = await Address.find({ address_usersid });
        if (!addresses || addresses.length === 0) {
            return res.status(404).json({ status: httpStatusText.FAIL, message: 'No addresses found' });
        }

        res.status(200).json({ status: httpStatusText.SUCCESS, data: addresses });
    } catch (error) {
        res.status(500).json({ status: httpStatusText.FAIL, message: error.message });
    }
};
