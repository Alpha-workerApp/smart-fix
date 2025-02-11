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

    ELECTRICAL_SERVICES = "Electrical Services"
    PLUMBING_SERVICES = "Plumbing Services"
    CARPENTRY_SERVICES = "Carpentry Services"
    HOUSE_CLEANING_SERVICES = "House Cleaning Services"
    PAINTING_SERVICES = "Painting Services"
    AC_HVAC_MAINTENANCE = "AC & HVAC Maintenance"
    SEWAGE_DRAIN_CLEANING = "Sewage and Drain Cleaning"
    WELDING_METALWORK = "Residential Welding and Metalwork"
    LOCKSMITH_SERVICES = "Locksmith Services"
    GENERATOR_INVERTER_MAINTENANCE = "Emergency Generator and Inverter Maintenance"
