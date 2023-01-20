class PiLitMusicPlayerException(Exception):
    """
    Base class for any PiLitMusicPlayer exception
    """


class PiLitFileNotFound(PiLitMusicPlayerException):
    def __init__(self, message):
        # Call the base class constructor with the parameters it needs
        super().__init__(message)
        self.message = message


class PiLitInvalidFileType(PiLitMusicPlayerException):
    def __init__(self, message):
        # Call the base class constructor with the parameters it needs
        super().__init__(message)
        self.message = message
