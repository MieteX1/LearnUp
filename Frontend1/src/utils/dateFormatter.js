export const formatRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInSeconds < 60) {
        return 'przed chwilą';
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes} ${getPluralForm(diffInMinutes, 'minuta', 'minuty', 'minut')} temu`;
    } else if (diffInHours < 24) {
        return `${diffInHours} ${getPluralForm(diffInHours, 'godzina', 'godziny', 'godzin')} temu`;
    } else if (diffInDays < 30) {
        return `${diffInDays} ${getPluralForm(diffInDays, 'dzień', 'dni', 'dni')} temu`;
    } else if (diffInMonths < 12) {
        return `${diffInMonths} ${getPluralForm(diffInMonths, 'miesiąc', 'miesiące', 'miesięcy')} temu`;
    } else {
        return `${diffInYears} ${getPluralForm(diffInYears, 'rok', 'lata', 'lat')} temu`;
    }
};

const getPluralForm = (number, form1, form2, form5) => {
    if (number === 1) {
        return form1;
    } else if (number % 10 >= 2 && number % 10 <= 4 && (number % 100 < 10 || number % 100 >= 20)) {
        return form2;
    } else {
        return form5;
    }
};