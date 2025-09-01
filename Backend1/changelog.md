## Endpointy

# Zwracanie informacji o użytkowniku
localhost:3000/api/auth/verify  

# rejestracja 
localhost:3000/api/auth/register

# login 
localhost:3000/api/auth/login

# Protect route example
localhost:3000/api/api/protectRouteExample

# refresh jwt token
localhost:3000/api/auth/refresh


# logout
localhost:3000/api/auth/logout 

# verify-email

localhost:3000/api/auth/verify-email

przyjmuje token z linku znajdujący się po ?token=,  przykład /api/auth/reset-password?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InF3ZXJ0eTIyM0A5ZGdnN3V3NW94N28ubWFpbGlzay5uZXQiLCJpYXQiOjE3MzIzOTEyNjUsImV4cCI6MTczMjQyNzI2NX0.59ZTHPSFqOwOQhQENnKBcNHhYe_u0zgf9HLSrddo3Po

# resend-verify-email 

localhost:3000/api/auth/resend-verify-email

z wysłanego przy rejestracji tokenu wydziela email i wysyła nowy link do rejestracji.

# forgot-password

localhost:3000/api/auth/forgot-password

przyjmuje adres email z formularza strony i wysyła link do strony zmiany hasła.

# reset-password

localhost:3000/api/auth/reset-password

endpoint przyjmujący token z linku wysłanego przez forgotPassword tak jak przy verify-email, oprócz tokenu przyjmuje nowe hasło które ma być ustawione dla użytkownika.

# change-password

localhost:3000/api/auth/change-password

reset hasła z np widoku konta użytkownika. Endpoint przepuszcza po posiadaniu tokenu dostępu. 

## new variable in .env
JWT_SECRET ="SECRET"
JWT_EXPIRE_IN = 10h 

REFRESH_JWT_SECRET ="REFRESH_SECRET"
REFRESH_JWT_EXPIRE_IN = 1d

## new variable in .env

VERIFIED_JWT_SECRET ="VERIFIED_SECRET"
VERIFIED_JWT_EXPIRE_IN = 10h

RESEND_VERIFIED_JWT_SECRET = "RESEND_VERIFIED_JWT_SECRET"
RESEND_VERIFIED_JWT_EXPIRE_IN = 10h


FORGOT_PASSWORD_JWT_SECRET = "FORGOT_PASSWORD_JWT_SECRET"
FORGOT_PASSWORD_JWT_EXPIRE_IN = 10h

# zmienne potrzebne do wysłania maila przez smtp, musicie podać dane swojego smtp coś jak to, zależnie jakiego emailhandlera używacie https://youtu.be/Wa9KDiB7C_I?t=43 

# przy testowaniu/przechodzeniu już na konta z weryfikacją trzeba używać maili z domeny waszego emailhandlera żeby mieć gdzie kliknąć po tą weryfikację.

EMAIL_HOST = 
EMAIL_PORT = 587
EMAIL_USERNAME = 
EMAIL_PASSWORD = 


DEFAULT_EMAIL_FROM = noreply@

# Task_gap
    dodano pole "text". Jest to zmienna która przechowuje... tekst😲.
    Ta zmienna jest opcjonalna, ponieważ w przeciwnym razie koliduje z CreateAnswerDto, więc warto validować notNull po stronie frontu
    Proponuję dodać jakiś znaczek, by zaznaczać miejsca dla luki. Coś typu "Lorem ☺ dolor sit amet".

# Evaluation + evaluation_value
    Komentarz + jego ocena. CRUD + parę endpointów typu get_by_collection_id. 
    Usunięcie komentara usuwa również odpowiedzi na ten komentarz
    lista komentarzy zwraca comment
# Subscription
    Subskrypcja ZBIORU. CRUD
    sprawdzanie czy użytkownik subskrybuje zbior (zwraca true\false)
# Answer
    CRUD + Find_by_id dla odpowiedzi. 
    ENDPOINT: odpowiedzi danego użytkownika dla danego zbioru
# Answer_type
    Answer_type jest czymś typu filtra - zmienna dodatkowa by nie pisać ten sam CRUD dla wszystkich typów zadań. 
# Ocena zbiorów zadań 
    Znajduje się w kontrolerze zbiorów, mimo że dotyczy odrębnej tabeli d bd. 
    getRank(id zbioru) zwraca object 
    {
        "_avg": {
            "points": 4.5
        },
        "_count": {
            "points": 2
        }
    }
# Task_collection
    Dodałem filtry i dużo endpointów (howManySubscribers, findManyWithFilter, getRank, findTaskWhitText)

# GetComments
    nieco lepsze sortowanie, ale wciąż nie idealne
    Dodano oceny komentarzy

# User
    +data rejestracji
    -name

# Dodanie moda z poziomu admina 
 wymagana rola admin
 localhost:3000/api/auth/create-moderator

# Kończenie rejestracji przez moderatora
Mod przechodzi pod ten endpoint przez link z wiadomości email, wymagane podanie hasła. Na razie byle jakiego ale wszystko już jest przygotowane na walidację aby podawać bezpieczne hasła.
localhost:3000/api/auth/setup-moderator-password

# Ręczne wysłanie wiadomość weryfikacyjnej na wypadek gdyby user się nie zdążył zweryfikować
  szerszy komentarz w pliku auth controler przy tym endpoincie.
  localhost:3000/api/auth/resending-verification-email-as-

# Endpointu który zwraca w tablicy obiekty z id userów oraz zliczonym czasem przebywania na stronie // do późniejszej zmiany
 localhost:3000/api/user/all-users-total-times

# to samo co wyżej tylko dla jednego usera po id z tokenu.
 localhost:3000/api/user/total-times


# Endpointy dotyczące przesyłania/pobierania plików
localhost:3000/api/uploads/avatarUploads - przesłanie avataru użytkownika przypisuje po id z tokenu dostępu

localhost:3000/api/uploads/CollectionCoverUploads/:id - przesłanie okładki zbioru zadań przypisuje do zbioru po id przesłanym w parametrach

localhost:3000/api/uploads/:id  - pobieranie obrazu przez id z użytkowika avatar_id lub zbioru zadań photo_id 

localhost:3000/api/uploads/:id - usuwanie zjęcia z serwera i z bazy po id jak wyżej

# Ogólne zmiany 
 Dodanie walidacji do haseł, później trzeba dodać wymagania które mają spełniać w , registerDTO
 change-password trzeba oprócz nowego hasła podać stare. 
 Należy dodać zmienną środowiskową w env APP_PORT = 5173 która jest używana w serwisie notyfikacji do wysłania linków z odpowiednim portem już pod frontend.
 Dodano wymóg podania loginu przy końceniu rejestracji moderatora przez email.
 Dodano system przesyłania i pobierania obrazów na serwer należy dodać zmienną UPLOAD_PATH = ./uploadedFiles do .env

# TODO
    sortowanie komentarzy
    skargi na zbiory, użytkowników i komentarze
    Przerobić dto użytkownika (wywalić rolę)
    Wywalić validatory ze wszystkich dto



## jeśli macie taki błąd to po wpisaniu takich komend powinno wszystko działać

src/task_collection/task_collection.service.ts:5:10 - error TS2305: Module '"@prisma/client/sql"' has no exported member 'getTasks'.

5 import { getTasks } from '@prisma/client/sql';

komendy do wpisania:
Npx prisma generate --sql
Npx prisma db push


Jeśli będziecie mieli błędy tego typu:

Error: Errors while reading sql files:

In prisma\sql\getComments.sql:
Error: kolumna e.is_deleted nie istnieje

to trzeba wpisać tak jak niżej i wtedy powinno przejsć: 
Npx prisma generate
Npx prisma db push
Npx prisma generate --sql
Npx prisma db push
