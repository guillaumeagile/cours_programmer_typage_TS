---
marp: true
paginate: true
title: Les types, alliés du code 

<!--
Diapos d'introduction au cours (support pour l'enseignant·e).
Format Marp : chaque `---` sépare une diapo, les commentaires HTML sont les notes de présentation.
Rendu : extension VS Code « Marp for VS Code », ou `pnpm dlx @marp-team/marp-cli test-types/INTRO.md`.
Durée suggérée : 15 min environ.
-->

# Les types, alliés de l'agentic coding

**Systèmes de types comme outil de conception**

BUT 3 · 3 h · chapitres A à E · TypeScript (mais pas seulement)

<!--
Annoncer le fil rouge : on ne va pas « apprendre la syntaxe de TypeScript », on va apprendre
à se servir d'un système de types pour concevoir, et voir pourquoi c'est encore plus
important quand une partie du code est écrite par une IA.
-->

---

# Les types, alliés de l'agentic coding

**Systèmes de types comme outil de conception**

BUT 3 · 3 h · chapitres A à E · TypeScript (mais pas seulement)

## Une question pour commencer

> Demain, une bonne partie du code que vous livrerez sera **générée** par un LLM ou un agent.
>
> **Qui vérifie ce code ? Et avec quoi ?**

- Relire à la main ? Lent, et on fatigue vite.
- Les tests ? Indispensables, mais ils ne couvrent que les cas qu'on a pensé à écrire.
- **Le compilateur** : il vérifie *tout* le code, *à chaque fois*, en quelques secondes.

<!--
Faire réagir la salle : qui utilise déjà Copilot, Cursor, Claude Code… ?
Qui a déjà eu du code généré qui « avait l'air juste » mais ne l'était pas ?
-->

---

## Deux machines complémentaires

| Le LLM | Le compilateur |
|--------|----------------|
| **probabiliste** : propose le code le plus plausible | **déterministe** : dit oui ou non, toujours de la même façon |
| créatif, rapide, parfois faux avec aplomb | borné, mais il ne se trompe pas sur ce qu'il vérifie |
| travaille sur du texte | travaille sur le **sens** du programme |

La boucle d'un agent de code :

```
générer  →  compiler / typer  →  lire les erreurs  →  corriger  →  …
```

Plus le système de types est **riche**, plus cette boucle attrape d'erreurs **avant** l'exécution.

<!--
Message clé : le compilateur est le meilleur partenaire d'un LLM, parce qu'il apporte
exactement ce qui manque au LLM : la certitude. Un message d'erreur de type est un
feedback précis, localisé, que l'agent sait exploiter.
-->

---

## Ce que les types apportent à un LLM (et à vous)

**🧱 Stabilité**
Des garde-fous : erreurs détectées tôt, refactorings sûrs (« renomme ce champ partout »), régressions bloquées à la compilation.

**📖 Information**
Une signature est une documentation qui **ne peut pas mentir**. L'agent comprend un module en lisant ses types, sans lire toute l'implémentation : moins de contexte, moins d'hallucinations.

**🎨 Expressivité**
On encode les **règles métier** dans les types : un `Email` n'est pas une `string`, une commande expédiée a forcément une date d'expédition.

<!--
Les trois mots de l'affiche : stabilité, information, expressivité.
On les retrouvera dans les chapitres : stabilité (A, B), information (D), expressivité (C, E).
-->

---

## Exemple : une signature qui ment, une signature honnête

```ts
// Ce que dit la signature : « donne-moi une string, je te rends un User »
function findUser(id: string): User
```

- et si l'utilisateur n'existe pas ? `null` ? une exception ?
- et si on passe un email à la place de l'id ? ça compile.

```ts
// Tout est dit dans le type
function findUser(id: UserId): Result<User, UserNotFound>
```

- impossible de passer un `Email` à la place d'un `UserId` (chapitre C)
- l'absence est **dans le type** : l'appelant est obligé de la traiter (chapitre D)

Pour un humain comme pour un LLM, la deuxième version **se lit sans ouvrir le code**.

---

## …à condition de savoir les maîtriser

Un système de types mal utilisé ne protège de rien :

```ts
const user = data as any;          // « fais-moi confiance »
function process(input: string, mode: string, flag: boolean) { … }
```

😱 Un agent pressé de « faire passer la compilation » ajoute volontiers des `as any`,
des `!` ou des `@ts-ignore`. Il **contourne** le compilateur au lieu de corriger.

👉 Les types sont un allié **si** :
- on modélise le domaine avec (pas des `string` partout)
- on interdit les échappatoires (`strict`, lint contre `any`)
- on sait **lire** et **juger** ce que l'IA propose

C'est l'objectif de ce cours.

<!--
Insister : maîtriser les types, c'est ce qui permet de rester le pilote.
Si vous ne savez pas reconnaître un mauvais typage, vous ne verrez pas que l'agent a triché.
-->

---

## La puissance des compilateurs

Un compilateur moderne ne fait pas que « traduire » :

- **inférence** : il devine les types sans qu'on les écrive
- **analyse de flux** : après `if (typeof x === 'string')`, il *sait* que `x` est une `string`
- **exhaustivité** : il signale le cas oublié dans un `switch`
- **preuves légères** : « ce code ne peut pas produire `null` », « cette ressource est libérée »

Chaque erreur attrapée à la compilation est un bug qui n'atteindra **jamais** la prod,
et qu'aucun test n'avait besoin de prévoir.

<!--
Exemple à citer : le borrow checker de Rust élimine une classe entière de bugs mémoire.
Le compilateur TypeScript fait de l'analyse de flux (narrowing), on le verra au chapitre A4.
-->

---

## Le spectre des systèmes de types

| Famille | Exemples | Ce que le compilateur garantit |
|---------|----------|--------------------------------|
| Dynamique | JavaScript, Python, Ruby | presque rien avant l'exécution |
| Graduel | **TypeScript**, Python + mypy | ce que vous avez annoté (et `any` désactive tout) |
| Nominal OO | Java, C# | les relations déclarées (`implements`, `extends`) |
| Types algébriques | Kotlin, Scala, F#, Rust, Swift, Haskell | unions fermées, exhaustivité, absence de `null` |
| Types dépendants | Idris, Lean, Agda | des propriétés mathématiques (« cette liste n'est pas vide ») |

TypeScript est au milieu : très expressif, mais **structurel** et **effacé à l'exécution**.
C'est pour ça qu'il surprend ceux qui viennent de Java ou C# (chapitre A3).

---

## Le compilateur ne connaît que le sens qu'on lui donne

```ts
function transfer(from: string, to: string, amount: number): void
```

Pour le compilateur : deux chaînes et un nombre. Inverser `from` et `to`, passer un montant
négatif, des centimes au lieu d'euros : **tout est valide**.

```ts
function transfer(from: AccountId, to: AccountId, amount: Money): Result<Transfer, TransferRefused>
```

Maintenant il sait : des comptes, de l'argent, un refus possible.

👉 Le compilateur vérifie la **cohérence**, pas la **vérité**. Il ne manipule que la syntaxe et la
sémantique que **nous** mettons dans le code.

Porter la juste sémantique est un travail de **conception**, et c'est celui du développeur.

<!--
Lien avec l'IA : un agent reproduit la sémantique présente dans vos types. Des `string`
partout, et il en écrira encore. Des types du domaine, et il est guidé (et bloqué) par eux.
Le design des types est la décision que vous ne déléguez pas.
-->

---

## Séparer le métier pur de la technique

```
┌─────────────── Technique : infra, effets de bord ───────────────┐
│  HTTP, base de données, horloge, e-mails, logs, aléatoire       │
│                                                                 │
│      ┌─────────────── Métier pur ──────────────┐                │
│      │  types du domaine, règles métier,       │                │
│      │  fonctions pures, aucune entrée/sortie  │                │
│      └─────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────────┘
```

```ts
// Métier pur : décide, ne fait rien. Testable sans mock, sans base, sans date système.
function decideRefund(order: Order, today: Date): Refund | RefundRefused

// Technique : lit, appelle le métier, écrit.
async function handleRefundRequest(orderId: OrderId): Promise<void> {
  const order = await orders.load(orderId);           // effet
  const decision = decideRefund(order, clock.now());  // pur
  await refunds.save(decision);                       // effet
}
```

Les types rendent la frontière **visible** : `Promise`, `Effect<A, E, R>`… signalent un effet.

<!--
Noms à citer : « functional core, imperative shell », architecture hexagonale (ports et
adaptateurs). Dans le cours : l'injection (B), les fonctions pures et honnêtes (D).
Bonus agentique : le cœur métier pur est l'endroit où l'on peut laisser travailler un agent
en confiance, car tout y est vérifiable par les types et les tests.
-->

---

## Les types établissent la sémantique du domaine

En DDD, un mot n'a de sens précis **qu'à l'intérieur d'un contexte délimité**
(*Bounded Context*). Le même « produit » n'est pas le même objet partout :

```ts
// catalogue/product.ts : ce qui compte pour vendre
type Product = { sku: Sku; name: string; price: Money; description: string };

// expedition/parcel.ts : ce qui compte pour livrer
type Parcel = { sku: Sku; weight: Kilograms; dimensions: Dimensions };
```

- Les noms des types **sont** le langage du métier (*ubiquitous language*) : un glossaire exécutable.
- Chaque contexte a **ses** types ; on ne partage pas un `Product` géant entre tous.
- Passer d'un contexte à l'autre est une **fonction de traduction explicite**, vérifiée par le compilateur.

👉 Les types ne servent pas qu'à éviter des bugs : ils **écrivent le modèle du domaine** dans le code.

<!--
Faire le lien avec le chapitre C (types du domaine, value objects) et E (un type par état).
Un expert métier doit pouvoir lire les noms de vos types et s'y retrouver.
-->

---

## Expressivité du langage « pur »

Le même modèle, « un paiement est soit une carte, soit un virement », sans aucune bibliothèque :

```ts
// TypeScript : union discriminée
type Payment = { kind: 'card'; number: string } | { kind: 'transfer'; iban: string };

const fees = (p: Payment, amount: number): number => {
  switch (p.kind) {
    case 'card': return amount * 0.02;
    case 'transfer': return 1;
  }
};
```

```java
// Java 21 : sealed + record + switch avec motifs
sealed interface Payment permits Card, Transfer {}
record Card(String number) implements Payment {}
record Transfer(String iban) implements Payment {}

double fees(Payment p, double amount) {
  return switch (p) {
    case Card c -> amount * 0.02;
    case Transfer t -> 1.0;
  };
}
```

<!--
Point commun : on ajoute un troisième type de paiement, le compilateur signale tous les
switch à compléter. C'est exactement ce que fait un bon agent : il compile, lit la liste
des erreurs, et complète chaque cas.
-->

---

## Expressivité du langage « pur » (suite)

```rust
// Rust : enum + match (exhaustif obligatoire)
enum Payment { Card { number: String }, Transfer { iban: String } }

fn fees(p: &Payment, amount: f64) -> f64 {
    match p {
        Payment::Card { .. } => amount * 0.02,
        Payment::Transfer { .. } => 1.0,
    }
}
```

```kotlin
// Kotlin : sealed interface + when
sealed interface Payment
data class Card(val number: String) : Payment
data class Transfer(val iban: String) : Payment

fun fees(p: Payment, amount: Double) = when (p) {
    is Card -> amount * 0.02
    is Transfer -> 1.0
}
```

Quatre langages, **une seule idée** : un type somme et un filtrage exhaustif.

---

## Quand le langage ne suffit pas : les bibliothèques d'extension

Elles apportent des types que le langage n'a pas (ou pas encore) :

| Langage | Bibliothèque | Ce qu'elle ajoute |
|---------|--------------|-------------------|
| Java | **Vavr** | `Option`, `Either`, `Try`, collections immuables |
| Kotlin | **Arrow** | `Either`, DSL `either { }` / `raise`, optics |
| C# | **LINQ** (intégré) | une syntaxe de requête qui enchaîne des transformations |
| C# | **LanguageExt** | `Option`, `Either`, `Fin`, effets, immuabilité |
| TypeScript | **Effect** | `Effect<Succès, Erreur, Dépendances>` : erreurs et dépendances **dans le type** |
| Python | **Returns** | `Result`, `Maybe`, `IO`, vérifiés par mypy |

Point commun : rendre **visibles dans le type** l'absence, l'erreur et les effets.

---

## Vavr (Java) et Arrow (Kotlin)

```java
// Vavr : plus de null, plus de try/catch dispersés
Option<User> user = repository.find(id);
String name = user.map(User::name).getOrElse("inconnu");

Try<Integer> age = Try.of(() -> Integer.parseInt(input));
```

```kotlin
// Arrow : l'erreur fait partie du type de retour
sealed interface AgeError { object NotANumber : AgeError; object Negative : AgeError }

fun parseAge(s: String): Either<AgeError, Int> = either {
    val n = ensureNotNull(s.toIntOrNull()) { AgeError.NotANumber }
    ensure(n >= 0) { AgeError.Negative }
    n
}
```

---

## LINQ et LanguageExt (C#)

```csharp
// LINQ : décrire QUOI, pas COMMENT
var paidTotal = orders
    .Where(o => o.Status == Status.Paid)
    .Sum(o => o.Amount);
```

```csharp
// LanguageExt : la même syntaxe LINQ pour enchaîner des opérations qui peuvent échouer
Either<Error, Receipt> receipt =
    from user  in FindUser(id)        // Either<Error, User>
    from order in PlaceOrder(user)    // Either<Error, Order>
    from paid  in Pay(order)          // Either<Error, Receipt>
    select paid;                      // s'arrête à la première erreur
```

😮 `from … select` n'est pas réservé aux listes : c'est une syntaxe générale pour **chaîner**.

---

## Effect (TypeScript) et Returns (Python)

```ts
// Effect : succès, erreur ET dépendances sont dans le type
import { Data, Effect } from 'effect';

class NotANumber extends Data.TaggedError('NotANumber')<{ input: string }> {}

const parseAge = (s: string): Effect.Effect<number, NotANumber> =>
  Number.isNaN(Number(s)) ? Effect.fail(new NotANumber({ input: s })) : Effect.succeed(Number(s));

const program = Effect.gen(function* () {
  const age = yield* parseAge('42');   // comme `await`, mais pour les erreurs typées
  return age + 1;
});                                    // Effect<number, NotANumber, never>
```

```python
# Returns : un Result vérifié par mypy
from returns.result import Result, Success, Failure, safe

@safe                                   # transforme l'exception en Failure
def parse_age(s: str) -> int:
    return int(s)                       # -> Result[int, Exception]

def check_adult(age: int) -> Result[int, str]:
    return Success(age) if age >= 18 else Failure("trop jeune")

parse_age("42").alt(str).bind(check_adult)
```

---

## La barrière de la syntaxe

Le **même concept** s'écrit très différemment selon les langages.

**« Une valeur peut être absente »**

| TS | Kotlin / C# | Java | Rust | Haskell | Python |
|----|-------------|------|------|---------|--------|
| `T \| undefined` | `T?` | `Optional<T>` | `Option<T>` | `Maybe a` | `T \| None` |

**« Enchaîner des opérations qui peuvent échouer »**

| Haskell | Scala | C# | F# | Kotlin (Arrow) | TS (Effect) | Rust |
|---------|-------|----|----|----------------|-------------|------|
| `do` | `for … yield` | `from … select` | `result { }` | `either { }` | `Effect.gen` + `yield*` | `?` |

👉 Derrière ces syntaxes, **une seule idée**. Une fois l'idée comprise, la syntaxe n'est qu'un détail.

<!--
Pour les curieux : cette idée commune s'appelle une monade. Pas besoin du mot pour
s'en servir ; le cours ne l'emploie pas.
Les LLM sont excellents pour traduire une syntaxe en une autre. Ce qu'ils ne font pas à
votre place, c'est choisir le bon concept. C'est ça la compétence qui reste humaine.
-->

---

## La barrière des styles : de l'OOP vers la FP

| Style objet (OOP) | Style fonctionnel (FP) |
|-------------------|------------------------|
| objets avec un état **mutable** | valeurs **immuables** |
| méthodes qui modifient `this` | fonctions **pures** : entrée → sortie |
| variation par **héritage** et polymorphisme | variation par **unions** et filtrage (`switch`, `match`) |
| erreurs par **exceptions** | erreurs dans le **type de retour** (`Result`, `Either`) |
| `null` | `Option` / `T \| undefined` |
| dépendances injectées via des **interfaces** | dépendances passées en **paramètres** (ou dans le type, avec Effect) |

- OOP : facile d'ajouter un **nouveau type** (une nouvelle classe), plus dur d'ajouter une opération.
- FP : facile d'ajouter une **nouvelle opération** (une fonction), plus dur d'ajouter un cas.

<!--
C'est le « problème de l'expression ». Aucun style ne gagne partout : il faut choisir selon
ce qui va changer le plus souvent dans votre domaine.
-->

---

## Pas l'un OU l'autre : les langages sont multi-paradigmes

TypeScript, Kotlin, C#, Scala, Swift, Java moderne : **les deux styles cohabitent**.

Le parcours du cours suit ce glissement :

| Chapitre | Style | Idée |
|----------|-------|------|
| A. Types comme contraintes | OOP | classes, interfaces, typage structurel, narrowing |
| B. Couplage et abstraction | OOP | dépendre d'un contrat, injecter, Liskov |
| C. Types du domaine | pivot | `Email` plutôt que `string`, value objects immuables |
| D. Fonctions honnêtes | FP | fonctions pures, `Result` plutôt qu'exceptions |
| E. États illégaux irreprésentables | FP | unions discriminées, `never`, exhaustivité |

On écrit le même genre de code métier, de plus en plus **expressif** et **sûr**.

---

## Comment on travaille aujourd'hui

- Chaque section est un **fichier de test** qu'on lit de haut en bas.
- `// @ts-expect-error` : une erreur de type **volontaire**. Supprimez le commentaire pour lire le message du compilateur.
- `// 😱` : un piège. Ça compile, ça tourne, mais ça ne fait pas ce que vous croyez.
- `it.todo('🫵 …')` : un exercice.

```bash
pnpm install
pnpm test test-types/chapter-a --watch
```

**Le compilateur est le test le plus rapide que vous ayez.** On commence.

<!--
Enchaîner directement sur chapter-a/01-types-and-objects.test.ts :
`5 * 'Laptop'` refusé, `5 + 'Laptop'` accepté.
-->
