import enum


class IDProofType(enum.Enum):
    """
    Enumeration of supported identity proof types.
    """

    AADHAAR = "Aadhaar"
    PAN = "PAN"
    VOTER_ID = "Voter ID"


class ServiceCategory(enum.Enum):
    """
    Enumeration of available service categories.
    """

    AC_HVAC_MAINTENANCE = "AC & HVAC Maintenance"
    CARPENTRY_SERVICES = "Carpentry Services"
    ELECTRICAL_SERVICES = "Electrical Services"
    HOUSE_CLEANING_SERVICES = "House Cleaning Services"
    MICROWAVE_REPAIR = "Microwave Repair"
    PAINTING_SERVICES = "Painting Services"
    PLUMBING_SERVICES = "Plumbing Services"
    REFRIGERATOR_REPAIR = "Refrigerator Repair"
    WASHING_MACHINE_REPAIR = "Washing Machine Repair"
    WATER_PURIFIER_REPAIR = "Water Purifier Repair"
